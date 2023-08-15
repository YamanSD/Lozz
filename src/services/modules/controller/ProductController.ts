import BaseController, { ControllerFlag } from "./BaseController";
import { basicProduct, Generic, product, productProperties, ProductSearchSchema } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionNames from "./CollectionNames";
import Product from "../model/product";
import { IdDoesNotExistError } from "./Errors";
import BaseModel from "../model/BaseModel";
import { isEqual } from "lodash";
import CategoryController from "./CategoryController";
import VendorController from "./VendorController";


export default class ProductController extends BaseController<product> {
  private static readonly flag: number =
    ControllerFlag.can_update
    | ControllerFlag.can_deactivate
    | ControllerFlag.can_delete
    | ControllerFlag.has_trail;

  /**
   * @param server firestore instance for the database
   */
  public constructor(server?: typeof firestore) {
    super(
      CollectionNames.product.name,
      CollectionNames.product.id,
      server ?? firestore,
      ProductController.flag,
      ProductSearchSchema
    );

    this.loadSearchData().then(() => {
      this.activateListener().then(() => {
        this.injectDependency();
      });
    });
  }

  /**
   * @returns the categories controller for the server,
   *          in the injected dependencies
   */
  public get categoryController(): CategoryController {
    return this.getDependency(CollectionNames.category.name);
  }

  /**
   * @returns the vendors controller for the server,
   *          in the injected dependencies
   */
  public get vendorController(): VendorController {
    return this.getDependency(CollectionNames.vendor.name);
  }

  /**
   * @returns the properties ID used to store properties locally
   */
  public get propertiesId() {
    return Product.exclusiveName;
  }

  /**
   * @returns the properties document
   */
  public get propertiesDocument() {
    return this.collection.doc(this.propertiesId);
  }

  /**
   * Creates the properties document on server in the products' collection,
   * if it does not exist.
   * Initially empty.
   * This method should be called from loop-2 of the application
   */
  public async checkOnProperties() {
    let document = await this.propertiesDocument.get();

    if (!document.exists) {
      const id = this.propertiesId;
      await this.createServer(id, {} as product);
      this.removeId(id); // Remove the added ID in the create server method
    }
  }

  /**
   * @returns the properties object from the server.
   *          Guaranteed to be undefined.
   */
  public async getServerProperties() {
    return (await this.propertiesDocument.get()).data() as Generic;
  }

  /**
   * @returns the properties object from the cache.
   *          If not present, fetched from server and added to cache.
   */
  public async getLocalProperties(): Promise<productProperties> {
    if (this.checkCache(this.propertiesId)) {
      return this.getCache(this.propertiesId) as Generic as productProperties;
    } else {
      const data = await this.getServerProperties();
      this.setCache(this.propertiesId, data as product);
      return data as productProperties;
    }
  }

  /**
   * @param properties new properties
   */
  public updateLocalProperties(properties: productProperties): void {
    this.setCache(this.propertiesId, properties as Generic as product);
  }

  /**
   * @param id to be refreshed in the local properties
   */
  public async updateIdProperty(id: string) {
    let local = await this.getLocalProperties();
    local[id] = BaseModel.getRandomTimestamp();
    this.updateLocalProperties(local);
  }

  /**
   * Uploads the local properties to the server
   */
  public async pushUpdateProperties() {
    await this.updateServer(
      this.getLocalProperties(),
      this.propertiesId,
      true
    );
  }

  /**
   * @param json_0 first object
   * @param json_1 second object
   * @returns Set containing the keys of both objects
   * @private
   */
  private static joinKeys(json_0: Generic,
                          json_1: Generic): Set<string> {
    let result = new Set<string>(Object.keys(json_0));

    for (let key of Object.keys(json_1)) {
      result.add(key);
    }

    return result;
  }

  /**
   * Activates the listener to the properties.
   * Updates the product.
   * These updates are not for the quantities, but for the product
   * properties (price, cost, etc...)
   * Quantities are updated by restocks manager.
   */
  public async activateListener() {
    // Temporary fix. Should be moved to local properties
    await this.checkOnProperties();

    this.propertiesDocument.onSnapshot(async (snapshot) => {
      let local = await this.getLocalProperties();
      let server = snapshot.data() ?? {};

      const keys = ProductController.joinKeys(local, server);

      for (let id of keys) {
        if (!(id in server)) {
          this.removeCache(id);
        } else if (!(id in local) || local[id] !== server[id]) {
          this.addCache(await this.get(id));
        }
      }

      this.updateLocalProperties(server);
    });
  }

  /**
   * Alias for this.setCache
   * @param product to be added to the cache
   * @private
   */
  private addCache(product: Product) {
    this.setCache(product.id, product.data);
  }

  /**
   * @param id of the product to be fetched
   * @returns product data
   * @throws IdDoesNotExistError if the id does not belong to a product
   */
  public async get(id: string) {
    const data = await this.getData(id);

    if (data === undefined) {
      throw new IdDoesNotExistError();
    }

    const vendor = await this.vendorController.get(data.vendor_id);
    const category = await this.categoryController.get(data.category_id);

    return new Product(data, vendor.data, category.data);
  }

  /**
   * @param data basic raw data to create a product
   * @throws IdAlreadyExistsError if the name of the product is taken
   */
  public async create(data: basicProduct) {
    await this.createServer(data.id, this.fillDataGaps(data));
    await this.uploadIds();
    await this.updateIdProperty(data.id);
  }

  /**
   * Updates the model on server.
   * Logs a property update.
   * Disregards quantities before upload.
   *
   * @param model new model of the product
   * @throws IdDoesNotExistError if the product does not exist
   */
  public async update(model: Product) {
    if (await this.isIdAvailable(model.name)) {
      throw new IdDoesNotExistError();
    }

    const currentData: Generic | undefined = this.getCache(model.name);
    const data: Generic | undefined = model.dataCopy;

    if (currentData === undefined) {
      await this.updateServer(data, model.name);
      await this.updateIdProperty(model.id);
      return;
    }

    for (let key of Object.keys(currentData)) {
      if (isEqual(currentData[key], data[key]) || data[key] === undefined) {
        delete data[key];
      }
    }

    delete data.quantities;
    delete data.inventory_quantities;

    await this.updateServer(data, model.name);
    await this.updateIdProperty(model.id);
  }

  /**
   * @param model to be updated in cache
   */
  public updateLocal(model: Product) {
    this.updateCache(model.id, model.data);
  }

  /**
   * Updates the model on server.
   * Does not trigger a property update.
   * Only updates quantities.
   *
   * @param model new model of the product
   * @param to_inventory if true uploads inventory quantities,
   *        if false, uploads display quantities,
   *        else if undefined uploads both.
   * @throws IdDoesNotExistError if the product does not exist
   */
  public async quantitiesUpdate(model: Product, to_inventory?: boolean) {
    if (await this.isIdAvailable(model.name)) {
      throw new IdDoesNotExistError();
    }

    let data = to_inventory === undefined ? {
      quantities: model.quantities,
      inventory_quantities: model.inventory_quantities
    } : (to_inventory ? {
      inventory_quantities: model.inventory_quantities
    } : {
      quantities: model.quantities
    });

    await this.updateServer(data, model.id, true);
  }

  /**
   * @param data basic product data
   * @returns product data suitable for upload
   * @protected
   */
  protected fillDataGaps(data: basicProduct): product {
    return super.fillDataGaps({
      id: data.id,
      name: data.name,
      vendor_id: data.vendor_id,
      category_id: data.category_id,
      images: data.images,
      increment: data.increment,
      quantities: data.quantities,
      minimum_quantity: data.minimum_quantity,
      price: data.price,
      added_price: data.added_price,
      inventory_quantities: data.quantities,
      instructions: data.instructions,
      cost: data.cost,
      added_costs: data.added_costs,
      discount: data.discount,
      description: data.description,
      trail: this.generateInitialTrail()
    });
  }
}
