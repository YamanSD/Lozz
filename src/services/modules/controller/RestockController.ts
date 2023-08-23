import BaseController, { ControllerFlag } from "./BaseController";
import {
  basicRestock,
  Generic,
  JointQuantityType,
  product,
  QuantityType,
  restock,
  RestockSearchSchema,
  SpecialFields,
  TrailNature,
  TrailType
} from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionInfo from "../../../CollectionInfo";
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


/**
 * Class responsible for handling operations on the restocks' collection.
 */
export default class RestockController extends BaseController<restock> {
  private static readonly flag: number =
    ControllerFlag.can_update
    | ControllerFlag.has_trail
    | ControllerFlag.can_deactivate;

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

    this.loadSearchData().then(() => {
      this.activateListener();
      this.injectDependency();
    });
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
   * @param data basic raw data to create a restocking
   * @throws IdAlreadyExistsError if the name of the restocking is taken
   * @throws EvalError if transaction fails
   */
  public async create(data: basicRestock) {
    await this.checkQuantities(data.quantities);

    let uploadData = this.fillDataGaps(data);
    const id = BaseModel.getRandomTimestamp(2);

    /* try to change quantities */
    await this.performQuantityTransaction(uploadData.quantities);

    /* create the restocking document on the server */
    await this.createServer(id, uploadData);
    await this.uploadIds();

    return id;
  }

  /**
   * Activates the restocks listener,
   * that modifies product quantities automatically
   */
  public activateListener() {
    this.collection.onSnapshot(snapshot => {
      snapshot.docChanges().forEach(async (change) => {
        const document = change.doc;
        const id = document.id;
        const data: restock | undefined = document.data() as restock;
        const productController = this.productController;
        const cacheCheck = this.checkCache(id);
        let products: Generic<Product> = {};
        let restock = new Restock(data);

        if (change.type === "added"
          || (change.type === "modified" && !cacheCheck)) {
          if (cacheCheck) {
            return;
          }

          for (let rusi of restock.products) {
            const usi_data = Product.invertUsi(rusi);
            const usi = Restock.removeTag(rusi);
            let product = products[usi_data.id]
              ?? await productController.get(usi_data.id);

            product.addUspQuantity(
              usi, restock.getQuantity(rusi), Restock.isToInventory(rusi)
            );

            await productController.updateLocal(product);
            products[usi_data.id] = product;
          }

          await this.setCache(id, restock.data);
        } else if (change.type === "modified") {
          /*
           * If in cache compare old with new,
           * otherwise enter to previous branch
           */
          let oldRestock = new Restock(this.getCache(id) as restock);
          const deactivated = restock.isDeactivated;

          for (let rusi of BaseController.joinKeys(
            restock.products, oldRestock.products)
            ) {
            const usi_data = Product.invertUsi(rusi);
            const usi = Restock.removeTag(rusi);
            let product = products[usi_data.id]
              ?? await productController.get(usi_data.id);

            product.addUspQuantity(
              usi,
              restock.getQuantity(rusi)
              // When deactivated the above & below term result in zero
              - oldRestock.getQuantity(rusi)
              - (deactivated ? restock.getQuantity(rusi) : 0),
              Restock.isToInventory(rusi)
            );

            await productController.updateLocal(product);
            products[usi_data.id] = product;
          }

          await this.updateCache(id, restock.data);
        } else if (change.type === "removed") {
          if (!cacheCheck) {
            return;
          }

          for (let rusi of restock.products) {
            const usi_data = Product.invertUsi(rusi);
            const usi = Restock.removeTag(rusi);
            let product = products[usi_data.id]
              ?? await productController.get(usi_data.id);

            product.addUspQuantity(
              usi, -restock.getQuantity(rusi), Restock.isToInventory(rusi)
            );

            await productController.updateLocal(product);
            products[usi_data.id] = product;
          }

          this.removeCache(id);
        }
      });
    });
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
      quantities: new_quantities,
      stamp: deactivate ? TrailNature.D : TrailNature.U,
      trail: oldRestock.trail
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
      restock.negativeQuantities,
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
  public static processRusi(quantities: QuantityType): {
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
                                           restockInfo?: {
                                               id: string,
                                               quantities: QuantityType,
                                               trail: TrailType,
                                               stamp: TrailNature
                                           }) {
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
      order_linked: false
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
      order_linked: data.order_linked,
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
      item_count: data.item_count,
      order_linked: data.order_linked,
      employee_id: BaseModel.initialEmployee(data[SpecialFields.trail]),
      quantities: Object.keys(data.quantities)
    };
  }
}
