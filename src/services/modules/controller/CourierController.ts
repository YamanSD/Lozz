import BaseController, { ControllerFlag, Generic } from "./BaseController";
import { basicCourier, courier, CourierSearchSchema } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionNames from "./CollectionNames";
import Courier from "../model/courier";
import { IdAlreadyExistsError, IdDoesNotExistError } from "./Errors";
import { isEqual } from "lodash";


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
    const data = await this.getData(name);

    if (data === undefined) {
      throw new IdDoesNotExistError();
    }

    return new Courier(data);
  }

  /**
   * @param data basic raw data to create a courier
   * @throws IdAlreadyExistsError if the name of the courier is taken
   */
  public async create(data: basicCourier) {
    if (!(await this.isIdAvailable(data.name))) {
      throw new IdAlreadyExistsError();
    }

    await this.createServer(data.name, this.fillDataGaps(data));
    await this.uploadIds();
  }

  /**
   * @param model new model of the courier
   * @throws IdDoesNotExistError if the courier does not exist
   */
  public async update(model: Courier) {
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
   * @param data basic courier data
   * @returns courier data suitable for upload
   * @protected
   */
  protected fillDataGaps(data: basicCourier): courier {
    return super.fillDataGaps({
      name: data.name,
      shipping_fees: data.shipping_fees,
      orders: [],
      trail: this.generateInitialTrail()
    });
  }
}
