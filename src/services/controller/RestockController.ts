import BaseController, { ControllerFlag } from "./BaseController";
import {
  basicRestock,
  Generic,
  JointQuantityType,
  product,
  QuantityType,
  restock,
  RestockSearchSchema, restockUpdate,
  SpecialFields,
  TrailNature,
} from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionInfo from "../../CollectionInfo";
import Restock from "../model/Restock";
import {
  EmptyRestockError,
  IdDoesNotExistError,
  NoUpdateError,
  ProductNotFoundError,
  RestockAlreadyRevokedError,
  RestockDeletionError
} from "./Errors";
import BaseModel from "../model/BaseModel";
import { sum } from "lodash";
import ProductController from "./ProductController";
import Product from "../model/Product";
import CategoryController from "./CategoryController";
import StatisticsBlock from "../local_model/StatisticsBlock";


/**
 * Class responsible for handling operations on the restocks' collection.
 */
export default class RestockController extends BaseController<restock> {
  private static readonly flag: number =
    ControllerFlag.can_update
    | ControllerFlag.has_trail
    | ControllerFlag.can_deactivate
    | ControllerFlag.statistical;

  /**
   * @param server firestore instance for the database
   */
  public constructor(server?: typeof firestore) {
    super(
      CollectionInfo.restock.name,
      CollectionInfo.restock.id,
      server ?? firestore,
      RestockController.flag,
      RestockSearchSchema
    );

    this.loadSearchData().then(async () => {
      this.activateListener();
      this.injectDependency();
      await this.loadStatistics();
    });
  }

  /**
   * Loads the restocks into the statistics iff the operation has not been done
   * @private
   */
  private async loadStatistics(): Promise<void> {
    if (StatisticsBlock.isLoaded(this.collectionName)) {
      return;
    }

    for (let id of this.idSet) {
      StatisticsBlock.addRestock(await this.get(id));
    }

    StatisticsBlock.setLoaded(this.collectionName);
  }

  /**
   * @returns the products controller for the server
   */
  public get productController(): ProductController {
    return BaseController.getDependency(
      CollectionInfo.product.name,
      ProductController,
      this.metaServer
    );
  }

  /**
   * @returns the categories controller for the server
   */
  public get categoryController(): CategoryController {
    return BaseController.getDependency(
      CollectionInfo.category.name,
      CategoryController,
      this.metaServer
    );
  }

  /**
   * @param id of the restocking to be fetched
   * @returns restock data
   * @throws IdDoesNotExistError if the id does not belong to a restocking
   */
  public async get(id: string) {
    const data = await this.getData(id);

    if (data === undefined) {
      throw new IdDoesNotExistError();
    }

    return new Restock(data);
  }

  /**
   * @param quantities to be transformed
   * @param to_inventory if true quantities are for the inventory only
   *                     false for display only,
   *                     undefined do nothing,
   *                     null for both.
   * @returns quantities for the inventory
   */
  public static transformQuantities(
    quantities: QuantityType,
    to_inventory: boolean | undefined | null
  ): QuantityType {
    if (to_inventory === undefined) {
      return quantities;
    }

    const restock = new Restock({
      quantities: quantities
    } as restock);

    if (to_inventory === null) {
      return restock.duplicateQuantities;
    }

    return restock.convertDestination(to_inventory);
  }

  /**
   * @param data basic raw data to create a restocking
   * @throws IdAlreadyExistsError if the name of the restocking is taken
   * @throws EvalError if transaction fails
   */
  public async create(data: basicRestock) {
    await this.checkQuantities(data.quantities);

    let uploadData = this.fillDataGaps(data);
    uploadData.quantities = RestockController.transformQuantities(
      uploadData.quantities,
      data.to_inventory
    );
    const id = BaseModel.getRandomTimestamp(2);

    /* try to change quantities */
    await this.performQuantityTransaction(uploadData.quantities);

    /* create the restocking document on the server */
    await this.createServer(id, uploadData);
    await this.uploadIds();

    return id;
  }

  /**
   * @throws NoUpdateError, restocks do not allow non-quantity updates
   */
  public async update(model: Restock) {
    throw new NoUpdateError();
  }

  /**
   * @param id ID of the restocking to be updated
   * @param new_quantities new quantities of the restocking
   * @param deactivate if true, stamp restock with deactivate rather than
   *        updated.
   */
  public async updateQuantities(
    id: string,
    new_quantities: QuantityType,
    deactivate?: boolean) {
    const oldRestock = await this.get(id);

    let quantities = RestockController.combineQuantities(
        new_quantities,
        oldRestock.quantities
    );

    // Also updates restock
    await this.performQuantityTransaction(quantities, {
      id: id,
      quantities: deactivate ? oldRestock.quantities : new_quantities,
      stamp: deactivate ? TrailNature.D : TrailNature.U,
      [SpecialFields.trail]: oldRestock.trail
    });
  }

  /**
   * @param id of the restocking operation whose effects revoked completely
   */
  public async revoke(id: string) {
    const restock = await this.get(id);

    if (restock.isDeactivated) {
      throw new RestockAlreadyRevokedError();
    }

    await this.updateQuantities(
      id,
      restock.zeroQuantities,
      true
    );
  }

  /**
   * @param quantities to be processed
   * @returns an object containing product IDs list sorted in descending order
   *          of their USP quantities & product quantities that map product IDs
   *          to their USP quantities
   * @private
   */
  private static processRusi(quantities: QuantityType): {
    productQuantities: JointQuantityType,
    productIds: string[]
  } {
    let result: JointQuantityType = {};

    // Can use a Max Heap to speed up (untested idea)
    let sums: Generic<number> = {};

    for (let rusi of Object.keys(quantities)) {
      const usi = Restock.removeTag(rusi);
      const id = Product.invertUsi(usi).id;
      const rusp = Product.usiToUsp(rusi);
      const quantity = quantities[rusi];

      if (!(id in result)) {
        result[id] = {
          [rusp]: quantity
        };

        sums[id] = quantity;
      } else {
        result[id][rusp] = quantity;
        sums[id] += quantity;
      }
    }

    let productIds = Object.keys(result);

    productIds.sort((rusi_0, rusi_1) => {
      return sums[rusi_1] - sums[rusi_0];
    });

    return {
      productQuantities: result,
      productIds: productIds
    };
  }

  /**
   * @param new_quantities
   * @param old_quantities
   * @returns the combined quantities object
   * @private
   */
  private static combineQuantities(new_quantities: QuantityType,
                                   old_quantities?: QuantityType): QuantityType {
    if (old_quantities === undefined) {
      return new_quantities;
    }

    let result = BaseModel.deepCopy(new_quantities);
    const rusiList = BaseController.joinKeys(result, old_quantities);

    for (let rusi of rusiList) {
      if (!(rusi in result)) {
        result[rusi] = 0;
      }

      result[rusi] -= old_quantities[rusi] ?? 0;
    }

    return result;
  }

  /**
   * Performs product quantities transaction for the restocking.
   *
   * @param quantities to be added to the product quantities on server
   * @param restockInfo if present, update the restocking document.
   * @returns null if the transaction worked, otherwise product ID that failed
   * @throws EvalError if the transaction fails due to quantities
   * @private
   */
  private async performQuantityTransaction(quantities: QuantityType,
                                           restockInfo?: restockUpdate) {
    await this.runTransaction(async (transaction) => {
      let products: Product[] = [];
      let references: Generic = {};

      let {
        productQuantities, productIds
      } = RestockController.processRusi(quantities);

      const productController = this.productController;
      const categoryController = this.categoryController;

      let documentRef, product: Product, data;
      // Default value to suppress error
      let productId: string = "";

      /* Read all products, check quantities for each */
      for (productId of productIds) {
        documentRef = productController.collection.doc(productId);
        const document = await transaction.get(documentRef);

        if (!document.exists) {
          throw new ProductNotFoundError();
        }

        data = document.data() as Generic as product;
        product = Product.generateWrapper(
          productId,
          data,
          await categoryController.get(data.category_id)
        );

        let quantityValues = productQuantities[productId];

        // Iterate over RUSPs and add to product
        for (let rusp of Object.keys(quantityValues)) {
          product.addSingle(
            quantityValues[rusp],
            Restock.removeTag(rusp),
            Restock.isToInventory(rusp)
          );
        }

        products.push(product);
        references[productId] = documentRef;
      }

      /* Update products */
      for (product of products) {
        await transaction.update(
          references[product.id],
          product.suitableQuantities()
        );
      }

      if (restockInfo !== undefined) {
        let trail = restockInfo.trail;

        this.stamp(trail, restockInfo.stamp);

        await transaction.update(
          this.collection.doc(restockInfo.id), {
            quantities: restockInfo.quantities,
            item_count: RestockController.countItems(restockInfo.quantities),
            [SpecialFields.trail]: trail
          }
        );
      }
    });
  }

  /**
   * @param quantities to be completely deleted without any trace
   * @param reason of deletion of the quantities
   */
  public async deleteQuantities(quantities: QuantityType, reason: string) {
    for (let quantity of Object.values(quantities)) {
      if (0 < quantity) {
        throw new RestockDeletionError();
      }
    }

    await this.create({
      note: reason,
      quantities: quantities,
    });
  }

  /**
   * Also checks if any of the products are deleted or deactivated.
   *
   * @param quantities to be checked
   * @throws InvalidRestockQuantitiesError if the quantities are mixed between
   *         positive and negative.
   * @throws ProductNotFoundError if any of the products is deleted
   *         or deactivated.
   * @throws EmptyRestockError if the restocking has all zero quantities
   * @private
   */
  private async checkQuantities(quantities: QuantityType) {
    const usiList = Object.keys(quantities);

    for (let usi of usiList) {
      const id = Product.invertUsi(usi).id;

      if (await this.productController.isIdAvailable(id)) {
        throw new ProductNotFoundError();
      }
    }

    for (let usi of usiList) {
      if (quantities[usi] === 0) {
        delete quantities[usi];
      }
    }

    if (Object.keys(quantities).length === 0) {
      throw new EmptyRestockError();
    }
  }

  /**
   * @param id of the restocking whose quantities moved
   *        to the inventory only.
   */
  public async transferToInventory(id: string) {
    const restock = await this.get(id);
    const quantities = restock.convertDestination(true);

    await this.updateQuantities(id, quantities);
  }

  /**
   * @param id of the restocking whose quantities moved
   *        to the display only.
   */
  public async transferFromInventory(id: string) {
    const restock = await this.get(id);
    const quantities = restock.convertDestination(false);

    await this.updateQuantities(id, quantities);
  }

  /**
   * Quantities not in the inventory are added to the inventory.
   * Quantities not on display are added to the on display.
   *
   * @param id of the restocking whose quantities moved
   *        to both inventory & display.
   */
  public async transferToBoth(id: string) {
    const restock = await this.get(id);
    const quantities = restock.duplicateQuantities;

    await this.updateQuantities(id, quantities);
  }

  /**
   * @param quantities to be counter
   * @returns the total number of items
   * @private
   */
  private static countItems(quantities: QuantityType): number {
    return Math.abs(sum(Object.values(quantities)));
  }

  /**
   * @param data basic restock data
   * @returns restock data suitable for upload
   * @protected
   */
  protected fillDataGaps(data: basicRestock): restock {
    return super.fixDataGaps({
      id: data.id,
      note: data.note,
      quantities: data.quantities,
      costs: data.costs,
      item_count: RestockController.countItems(data.quantities),
      trail: this.generateInitialTrail()
    });
  }

  /**
   * @param data to be fixed
   * @returns data suitable for the search engine insertion schema
   * @protected
   */
  protected fixSearchEngineData(data: restock): Generic {
    return {
      id: data.id,
      date: data.id,
      note: data.note,
      invoice_linked: data.costs !== undefined,
      item_count: data.item_count,
      employee_id: BaseModel.initialEmployee(data[SpecialFields.trail]),
      quantities: Object.keys(data.quantities)
    };
  }

  /**
   * @param id of the restock to be inserted to statistics
   * @protected
   */
  protected async insertStatistic(id: string): Promise<void> {
    StatisticsBlock.addRestock(await this.get(id));
  }

  /**
   * @param id of the restock to be removed to statistics
   * @protected
   */
  protected async removeStatistic(id: string): Promise<void> {
    StatisticsBlock.subtractRestock(await this.get(id));
  }
}
