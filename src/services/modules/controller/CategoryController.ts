import BaseController, { ControllerFlag } from "./BaseController";
import { basicCategory, category, CategorySearchSchema, Generic } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionNames from "./CollectionNames";
import Category from "../model/category";
import { IdAlreadyExistsError, IdDoesNotExistError } from "./Errors";
import { isEqual } from "lodash";


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
    const data = await this.getData(name);

    if (data === undefined) {
      throw new IdDoesNotExistError();
    }

    return new Category(data);
  }

  /**
   * @param data basic raw data to create a category
   * @throws IdAlreadyExistsError if the name of the category is taken
   */
  public async create(data: basicCategory) {
    if (!(await this.isIdAvailable(data.name))) {
      throw new IdAlreadyExistsError();
    }

    await this.createServer(data.name, this.fillDataGaps(data));
    await this.uploadIds();
  }

  /**
   * @param model new model of the category
   * @throws IdDoesNotExistError if the category does not exist
   */
  public async update(model: Category) {
    if (await this.isIdAvailable(model.name)) {
      throw new IdDoesNotExistError();
    }

    const currentData: Generic | undefined = this.getCache(model.name);
    const data: Generic | undefined = model.dataCopy;

    if (currentData === undefined) {
      await this.updateServer(data, model.name);
      return;
    }

    for (let key of Object.keys(currentData)) {
      if (isEqual(currentData[key], data[key]) || data[key] === undefined) {
        delete data[key];
      }
    }

    await this.updateServer(data, model.name);
  }

  /**
   * @param data basic category data
   * @returns category data suitable for upload
   * @protected
   */
  protected fillDataGaps(data: basicCategory): category {
    return super.fillDataGaps({
      name: data.name,
      options_keys: data.option_keys,
      options_sets: data.options_sets,
      added_price: data.added_price,
      trail: this.generateInitialTrail()
    });
  }
}
