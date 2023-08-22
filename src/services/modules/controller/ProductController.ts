import BaseController, { ControllerFlag } from "./BaseController";
import {
  basicProduct,
  Generic,
  product,
  productProperties,
  ProductSearchSchema,
  SpecialFields
} from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionInfo from "../../../CollectionInfo";
import Product from "../model/Product";
import { IdAlreadyExistsError, IdDoesNotExistError } from "./Errors";
import BaseModel from "../model/BaseModel";
import CategoryController from "./CategoryController";
import VendorController from "./VendorController";


/**
 * Class responsible for handling operations on the products' collection.
 */
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
      CollectionInfo.product.name,
      CollectionInfo.product.id,
      server ?? firestore,
      ProductController.flag,
      ProductSearchSchema
    )

    this.removeId(this.propertiesId);

    this.loadSearchData().then(() => {
      this.activateListener();
      this.injectDependency();
    });
  }

  /**
   * @returns the categories controller for the server,
   *          in the injected dependencies
   */
  public get categoryController(): CategoryController {
    return BaseController.getDependency(
      CollectionInfo.category.name,
      CategoryController,
      this.metaServer
    );
  }

  /**
   * @returns the vendors controller for the server,
   *          in the injected dependencies
   */
  public get vendorController(): VendorController {
    return BaseController.getDependency(
      CollectionInfo.vendor.name,
      VendorController,
      this.metaServer
    );
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
   * This method should be called from layer-2 of the application
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
    let data;

    if (this.checkCache(this.propertiesId)) {
      data = this.getCache(this.propertiesId) as Generic as productProperties;
    } else {
      data = await this.getServerProperties();
      await this.setCache(this.propertiesId, data as product);
    }

    delete data.id;

    return data;
  }

  /**
   * @param properties new properties
   */
  public async updateLocalProperties(properties: productProperties) {
    await this.updateCache(this.propertiesId, properties as Generic as product);
  }

  /**
   * @param id to be refreshed in the local properties
   */
  public async updateIdProperty(id: string) {
    let local = await this.getLocalProperties();
    local[id] = BaseModel.currentTimestamp;

    await this.updateServer(
      local,
      this.propertiesId,
      true
    );
  }

  /**
   * Activates the listener to the properties.
   * Updates the product.
   * These updates are not for the quantities, but for the product
   * properties (price, cost, etc...)
   * Quantities are updated by restocks manager.
   */
  public activateListener() {
    this.propertiesDocument.onSnapshot(async (snapshot) => {
      let local = await this.getLocalProperties();
      let server = snapshot.data() ?? {};
      const keys = BaseController.joinKeys(local, server);

      for (let id of keys) {
        if (!(id in server)) {
          this.removeCache(id);
        } else if (!(id in local) || local[id] !== server[id]) {
          const data = (await this.getServer(id)).data() as Generic;

          data.id = id;

          await this.updateCache(id, data as product);
        }
      }

      await this.updateLocalProperties(server);
    });
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
    if (!(await this.isIdAvailable(data.id))) {
      throw new IdAlreadyExistsError();
    }

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
    if (await this.isIdAvailable(model.id)) {
      throw new IdDoesNotExistError();
    }

    const currentData: Generic | undefined = this.getCache(model.id);
    const data: Generic | undefined = model.dataCopy;

    if (currentData === undefined) {
      await this.updateServer(data, model.id);
    } else {
      BaseController.clearAlikeFieldsFromNew(currentData, data);

      delete data.quantities;
      delete data.inventory_quantities;

      await this.updateServer(data, model.id);
    }

    await this.updateIdProperty(model.id);
  }

  /**
   * @param model to be updated in cache
   */
  public async updateLocal(model: Product) {
    await this.updateCache(model.id, model.data);
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
    return super.fixDataGaps({
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
      [SpecialFields.trail]: this.generateInitialTrail()
    });
  }

  /**
   * @param data to be fixed
   * @returns data suitable for the search engine insertion schema
   * @protected
   */
  protected fixSearchEngineData(data: product): Generic {
    let quantities = data.quantities;
    let available_values: Set<string> = new Set<string>();

    for (let usp of Object.keys(quantities)) {
      if (quantities[usp] !== 0) {
        Product.invertUsp(usp).forEach(value => {
          available_values.add(value);
        });
      }
    }

    return {
      id: data.id,
      name: data.name,
      vendor_id: data.vendor_id,
      category_id: data.category_id,
      price: data.price,
      cost: data.cost,
      discounted: data.discount === undefined,
      description: data.description,
      available_values: Array.from<string>(available_values.values())
    };
  }
}
