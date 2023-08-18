import BaseController, { ControllerFlag } from "./BaseController";
import {
  basicRestock,
  Generic,
  JointQuantityType, product,
  QuantityType,
  restock,
  RestockSearchSchema
} from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionInfo from "../../../CollectionInfo";
import Restock from "../model/Restock";
import {
  EmptyRestockError,
  IdDoesNotExistError,
  IllegalStateError,
  NoUpdateError, ProductNotFoundError
} from "./Errors";
import BaseModel from "../model/BaseModel";
import { sum } from "lodash";
import ProductController from "./ProductController";
import Product from "../model/Product";
import DependencyTree from "./DependencyTree";


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

  public get productController(): ProductController {
    return DependencyTree.Products;
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

    const id = BaseModel.getRandomTimestamp(2);

    await this.performQuantityTransaction(data.quantities, data.to_inventory);

    await this.createServer(id, this.fillDataGaps(data));
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
        // undefined if removed
        const data: restock | undefined = document.data() as restock;
        const id = document.id;
        const productController = this.productController;
        let restock = new Restock(data);

        if (change.type === "added") {
          for (let usi of restock.products) {
            const usi_data = Product.invertUsi(usi);
            let product = await productController.get(usi_data.id);

            product.addUspQuantity(
              usi, restock.getQuantity(usi), restock.to_inventory
            );

            productController.updateLocal(product);
          }

          this.setCache(id, restock.data);
        } else if (change.type === "modified") {
          // If in cache, remove quantities, otherwise ignore.
          if (this.checkCache(id)) {
            let oldRestock = new Restock(this.getCache(id) as restock);
            const diff = oldRestock.to_inventory !== restock.to_inventory;

            for (let usi of restock.products) {
              const usi_data = Product.invertUsi(usi);
              let product = await productController.get(usi_data.id);

              product.addUspQuantity(
                usi,
                restock.getQuantity(usi)
                - (diff ? 0 : oldRestock.getQuantity(usi)),
                restock.to_inventory
              );

              productController.updateLocal(product);
            }

            this.updateCache(id, restock.data);
          } else {

          }
        } else {
          throw new IllegalStateError();
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
   * @param to_inventory if false update only display quantities,
   *        if true update only inventory,
   *        if undefined update both.
   */
  public async updateQuantities(
    id: string,
    new_quantities: QuantityType,
    to_inventory: boolean | undefined
  ) {
    const oldRestock = await this.get(id);

    let quantities = RestockController.combineQuantities(
        new_quantities,
        oldRestock.quantities
    );

    await this.performQuantityTransaction(quantities, to_inventory, id);
  }

  /**
   * @param id of the restocking operation whose effects revoked completely
   * @param to_inventory if true return values to inventory only,
   *        if false return values to display only,
   *        if undefined return to both
   */
  public async revoke(id: string, to_inventory: boolean | undefined) {
    const restock = await this.get(id);

    await this.performQuantityTransaction(
      restock.negativeQuantities,
      to_inventory
    );

    await this.deactivate(id);
  }

  /**
   * @param quantities to be processed
   * @returns an object containing product IDs list sorted in descending order
   *          of their USP quantities & product quantities that map product IDs
   *          to their USP quantities
   * @private
   */
  private static processUsi(quantities: QuantityType): {
    productQuantities: JointQuantityType,
    productIds: string[]
  } {
    let result: JointQuantityType = {};

    // Can use a Max Heap to speed up (untested idea)
    let sums: Generic<number> = {};

    for (let usi of Object.keys(quantities)) {
      const id = Product.invertUsi(usi).id;
      const usp = Product.usiToUsp(usi);
      const quantity = quantities[usi];

      if (!(id in result)) {
        result[id] = {
          usp: quantity
        };

        sums[id] = quantity;
      } else {
        result[id][usp] = quantity;
        sums[id] += quantity;
      }
    }

    let productIds = Object.keys(result);

    productIds.sort((usi_0, usi_1) => {
      return sums[usi_1] - sums[usi_0];
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

    const usiList = BaseController.joinKeys(new_quantities, old_quantities);

    for (let usi of usiList) {
      if (!(usi in new_quantities)) {
        new_quantities[usi] = 0;
      }

      new_quantities[usi] -= old_quantities[usi] ?? 0;
    }

    return new_quantities;
  }

  /**
   * Performs product quantities transaction for the restocking.
   *
   * @param quantities to be added to the product quantities on server
   * @param to_inventory boolean flag to indicate whether the quantities
   *        are for the inventory or not
   * @param restock_id if present, update the to_inventory field of the
   *        restock document.
   * @returns null if the transaction worked, otherwise product ID that failed
   * @throws EvalError if the transaction fails due to quantities
   * @private
   */
  private async performQuantityTransaction(quantities: QuantityType,
                                           to_inventory: boolean | undefined,
                                           restock_id?: string) {
    await this.runTransaction(async (transaction) => {
      let products: Product[] = [];
      let references: Generic = {};

      let {
        productQuantities, productIds
      } = RestockController.processUsi(quantities);

      const productController = this.productController;
      let document, product: Product, data: product;
      // Default value to suppress error
      let productId: string = "";

      /* Read all products, check quantities for each */
      for (productId of productIds) {
        document = productController.collection.doc(productId);
        data = (await transaction.get(document)) as Generic as product;
        product = Product.generateWrapper(productId, data);

        product.add(productQuantities[productId], to_inventory);
        products.push(product);
        references[productId] = document;
      }

      /* Update products */
      for (product of products) {
        await transaction.update(
          references[product.id],
          product.suitableQuantities(to_inventory)
        );
      }

      if (restock_id !== undefined) {
        await transaction.update(
          this.collection.doc(restock_id), {
            to_inventory: to_inventory ?? firestore.FieldValue.delete()
          }
        );
      }
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
      to_inventory: data.to_inventory,
      quantities: data.quantities,
      order_linked: data.order_linked,
      item_count: RestockController.countItems(data.quantities),
      trail: this.generateInitialTrail()
    });
  }
}
