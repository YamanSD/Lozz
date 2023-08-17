import BaseController, { ControllerFlag } from "./BaseController";
import { basicCategory, category, CategorySearchSchema, SpecialFields } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionNames from "./CollectionNames";
import Category from "../model/category";


/**
 * Class responsible for handling operations on the vendors' collection.
 */
export default class CategoryController extends BaseController<category> {
  private static readonly flag: number =
    ControllerFlag.can_deactivate
    | ControllerFlag.can_update
    | ControllerFlag.has_trail;

  /**
   * @param server firestore instance for the database
   */
  public constructor(server?: typeof firestore) {
    super(
      CollectionNames.category.name,
      CollectionNames.category.id,
      server ?? firestore,
      CategoryController.flag,
      CategorySearchSchema
    );

    this.loadSearchData().then(() => {
      this.activateListener();
      this.injectDependency();
    });
  }

  /**
   * @param name of the category to be fetched
   * @returns category data
   * @throws IdDoesNotExistError if the name does not belong to a category
   */
  public async get(name: string) {
    return await this.genericGet(Category, name);
  }

  /**
   * @param data basic raw data to create a category
   * @throws IdAlreadyExistsError if the name of the category is taken
   */
  public async create(data: basicCategory) {
    return await this.genericCreate(data, data.name);
  }

  /**
   * @param model new model of the category
   * @throws IdDoesNotExistError if the category does not exist
   */
  public async update(model: Category) {
    return await this.genericUpdate(model, model.name);
  }

  /**
   * @param data basic category data
   * @returns category data suitable for upload
   * @protected
   */
  protected fillDataGaps(data: basicCategory): category {
    return super.fixDataGaps({
      name: data.name,
      options_keys: data.option_keys,
      options_sets: data.options_sets,
      added_price: data.added_price,
      [SpecialFields.trail]: this.generateInitialTrail()
    });
  }
}
