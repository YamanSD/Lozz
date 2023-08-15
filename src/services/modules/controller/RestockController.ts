import BaseController, { ControllerFlag } from "./BaseController";
import {
  basicRestock,
  Generic,
  JointQuantityType, product,
  QuantityType,
  restock,
  RestockSearchSchema
} from "../model/types";
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import CollectionNames from "./CollectionNames";
import Restock from "../model/restock";
import {
  IdDoesNotExistError,
  IllegalStateError,
  InvalidRestockQuantitiesError,
  NoDeleteError,
  NoUpdateError, ProductNotFoundError
} from "./Errors";
import BaseModel from "../model/BaseModel";
import { sum } from "lodash";
import ProductController from "./ProductController";
import Product from "../model/Product";
import DocumentReference = FirebaseFirestoreTypes.DocumentReference;


export default class RestockController extends BaseController<restock> {
  private static readonly flag: number =
    ControllerFlag.can_update
    | ControllerFlag.has_trail;

  /**
   * @param server firestore instance for the database
   */
  public constructor(server?: typeof firestore) {
    super(
      CollectionNames.restock.name,
      CollectionNames.restock.id,
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
    return this.getDependency(CollectionNames.product.name);
  }

  /**
   * @param id of the restock to be fetched
   * @returns restock data
   * @throws IdDoesNotExistError if the id does not belong to a restock
   */
  public async get(id: string) {
    const data = await this.getData(id);

    if (data === undefined) {
      throw new IdDoesNotExistError();
    }

    return new Restock(data);
  }

  /**
   * @param data basic raw data to create a restock
   * @throws IdAlreadyExistsError if the name of the restock is taken
   * @throws EvalError if transaction fails
   */
  public async create(data: basicRestock) {
    await this.checkQuantities(data.quantities);

    const id = BaseModel.getRandomTimestamp(2);

    await this.performQuantityTransaction(data.quantities, data.to_inventory);

    await this.createServer(id, this.fillDataGaps(data));
    await this.uploadIds();
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
        let restock = new Restock(data);

        if (change.type === "added") {
          for (let usi of restock.products) {
            const usi_data = Product.invertUsi(usi);
            let product = await this.productController.get(usi_data.id);

            product.addUspQuantity(
              usi, restock.getQuantity(usi), restock.to_inventory
            );

            this.productController.updateLocal(product);
          }

          this.setCache(id, restock.data);
        } else if (change.type === "removed") {
          // If in cache, remove quantities, otherwise ignore.
          if (this.checkCache(id)) {
            restock = new Restock(this.getCache(id) as restock);

            for (let usi of restock.products) {
              const usi_data = Product.invertUsi(usi);
              let product = await this.productController.get(usi_data.id);

              product.addUspQuantity(
                usi, -restock.getQuantity(usi), restock.to_inventory
              );

              this.productController.updateLocal(product);
            }

            this.removeCache(id);
          }
        } else {
          throw new IllegalStateError();
        }
      });
    });
  }

  /**
   * @param model new model of the restock
   * @throws IdDoesNotExistError if the restock does not exist
   */
  public async update(model: Restock) {
    throw new NoUpdateError();
  }

  /**
   * @param id to be deleted completely and its effects revoked
   * @throws NoDeleteError if the restock is not deletable
   */
  public async revock(id: string) {
    const restock = await this.get(id);

    if (!restock.deletable) {
      throw new NoDeleteError();
    }

    await this.performQuantityTransaction(
      restock.negativeQuantities,
      restock.to_inventory
    );

    await this.removeServer(id);
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
   * Performs product quantities transaction for the restock.
   *
   * @param quantities to be added to the product quantities on server
   * @param to_inventory boolean flag to indicate whether the quantities
   *        are for the inventory or not
   * @returns null if the transaction worked, otherwise product ID that failed
   * @throws EvalError if the transaction fails due to quantities
   * @private
   */
  private async performQuantityTransaction(quantities: QuantityType,
                                           to_inventory: boolean) {
    await this.runTransaction(async (transaction) => {
      let products: Product[] = [];
      let references: Generic<DocumentReference> = {};

      let {
        productQuantities, productIds
      } = RestockController.processUsi(quantities);

      const productController = this.productController;
      let document: DocumentReference, product: Product, data: product;
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
   * @private
   */
  private async checkQuantities(quantities: QuantityType) {
    for (let usi of Object.keys(quantities)) {
      const id = Product.invertUsi(usi).id;

      if (await this.productController.isIdAvailable(id)) {
        throw new ProductNotFoundError();
      }
    }

    let isNegative: boolean | undefined = undefined;

    for (let quantity of Object.values(quantities)) {
      if (isNegative === undefined) {
        isNegative = quantity < 0;
      } else if (isNegative === (0 < quantity)) {
        throw new InvalidRestockQuantitiesError();
      }
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
    return super.fillDataGaps({
      id: data.id,
      note: data.note,
      to_inventory: data.to_inventory,
      quantities: data.quantities,
      order_id: data.order_id,
      item_count: RestockController.countItems(data.quantities),
      employee_id: BaseModel.currentEmployee,
    });
  }
}
