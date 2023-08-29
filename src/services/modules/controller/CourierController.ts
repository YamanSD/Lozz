import BaseController, { ControllerFlag } from "./BaseController";
import { basicCourier, courier, CourierSearchSchema, Generic, SpecialFields } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionNames from "../../../CollectionInfo";
import Courier from "../model/Courier";
import { NotStatisticalError } from "./Errors";


/**
 * Class responsible for handling operations on the couriers' collection.
 */
export default class CourierController extends BaseController<courier> {
  private static readonly flag: number =
    ControllerFlag.can_deactivate
    | ControllerFlag.can_update
    | ControllerFlag.has_trail;

  /**
   * @param server firestore instance for the database
   */
  public constructor(server?: typeof firestore) {
    super(
      CollectionNames.courier.name,
      CollectionNames.courier.id,
      server ?? firestore,
      CourierController.flag,
      CourierSearchSchema
    );

    this.loadSearchData().then(() => {
      this.activateListener();
      this.injectDependency();
    });
  }

  /**
   * @param name of the courier to be fetched
   * @returns courier data
   * @throws IdDoesNotExistError if the name does not belong to a courier
   */
  public async get(name: string) {
    return await this.genericGet(Courier, name);
  }

  /**
   * @param data basic raw data to create a courier
   * @throws IdAlreadyExistsError if the name of the courier is taken
   */
  public async create(data: basicCourier) {
    return await this.genericCreate(data, data.name);
  }

  /**
   * @param model new model of the courier
   * @throws IdDoesNotExistError if the courier does not exist
   */
  public async update(model: Courier) {
    return await this.genericUpdate(model, model.name);
  }

  /**
   * @param data basic courier data
   * @returns courier data suitable for upload
   * @protected
   */
  protected fillDataGaps(data: basicCourier): courier {
    return super.fixDataGaps({
      name: data.name,
      shipping_fees: data.shipping_fees,
      [SpecialFields.trail]: this.generateInitialTrail()
    });
  }

  /**
   * @param data to be fixed
   * @returns data suitable for the search engine insertion schema
   * @protected
   */
  protected fixSearchEngineData(data: courier): Generic {
    return {
      id: data.name,
      name: data.name,
      provinces: Object.keys(data.shipping_fees),
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
