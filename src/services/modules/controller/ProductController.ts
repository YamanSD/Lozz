import BaseController, { ControllerFlag } from "./BaseController";
import {
  basicProduct,
  Generic,
  product,
  ProductSearchSchema,
  SpecialFields
} from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionInfo from "../../../CollectionInfo";
import Product from "../model/Product";
import { IdDoesNotExistError } from "./Errors";
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
    return await this.genericCreate(data, data.id);
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

    await this.updateServer(data, model.id);
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
