import BaseController, { ControllerFlag } from "./BaseController";
import { basicCategory, category, CategorySearchSchema, Generic, SpecialFields } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionInfo from "../../../CollectionInfo";
import Category from "../model/Category";
import { NotStatisticalError } from "./Errors";


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
      CollectionInfo.category.name,
      CollectionInfo.category.id,
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
      option_keys: data.option_keys,
      option_sets: data.option_sets,
      added_price: data.added_price,
      [SpecialFields.trail]: this.generateInitialTrail()
    });
  }

  /**
   * @param data to be fixed
   * @returns data suitable for the search engine insertion schema
   * @protected
   */
  protected fixSearchEngineData(data: category): Generic {
    return {
      id: data.name,
      name: data.name,
      option_keys: data.option_keys
    };
  }

  /**
   * @param id
   * @protected
   */
  protected insertStatistic(id: string): Promise<void> {
    throw new NotStatisticalError();
  }

  /**
   * @param id
   * @protected
   */
  protected removeStatistic(id: string): Promise<void> {
    throw new NotStatisticalError();
  }
}
