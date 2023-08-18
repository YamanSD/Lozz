import BaseController, { ControllerFlag } from "./BaseController";
import { basicProperties, Generic, information, InformationType } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionInfo from "../../../CollectionInfo";
import { IdDoesNotExistError, IllegalStateError } from "./Errors";
import RateInformation from "../model/RateInformation";
import ProvinceInformation from "../model/ProvinceInformation";
import { isEqual } from "lodash";


/**
 * Alias for all information models
 */
export type InformationModels = RateInformation | ProvinceInformation;

/**
 * Class responsible for handling operations on the information collection.
 */
export default class InformationController
  extends BaseController<information> {
  private static readonly flag: number =
    ControllerFlag.can_update
    | ControllerFlag.has_trail
    | ControllerFlag.no_id_list;

  /**
   * @param server firestore instance for the database
   */
  public constructor(server?: typeof firestore) {
    super(
      CollectionInfo.information.name,
      CollectionInfo.information.id,
      server ?? firestore,
      InformationController.flag
    );

    this.loadSearchData().then(() => {
      this.activateListener();
      this.injectDependency();
    });
  }

  /**
   * Note that this function is called only once by layer-2
   *
   * @param data to be created
   */
  public async create(data: basicProperties) {
    for (let type of Object.keys(data)) {
      let uploadData =
        data[type as InformationType] as Generic;

      uploadData.trail = this.generateInitialTrail();

      await this.createServer(type, uploadData as information);
    }
  }

  /**
   * @param model of information to be updated
   */
  public async update(model: InformationModels) {
    const currentData: Generic | undefined = this.getCache(model.type);
    const data: Generic | undefined = model.dataCopy;

    if (currentData === undefined) {
      await this.updateServer(data, model.type);
      return;
    }

    for (let key of Object.keys(currentData)) {
      if (isEqual(currentData[key], data[key]) || data[key] === undefined) {
        delete data[key];
      }
    }

    await this.updateServer(data, model.type);
  }

  /**
   * @param type of the information
   * @returns an information model
   */
  public async get(type: InformationType) {
    const data = await this.getData(type);

    if (data === undefined) {
      throw new IdDoesNotExistError();
    }

    return type === InformationType.rate
      ? new RateInformation(data)
      : new ProvinceInformation(data);
  }

  /**
   * @returns the provinces information object
   */
  public async getProvinces(): Promise<ProvinceInformation> {
    return await this.get(InformationType.provinces) as ProvinceInformation;
  }

  /**
   * @returns the rate information object
   */
  public async getRate(): Promise<RateInformation> {
    return await this.get(InformationType.rate) as RateInformation;
  }

  /**
   * @param data to be fixed
   * @throws IllegalStateError
   * @protected
   */
  protected fillDataGaps(data: Generic): information {
    throw new IllegalStateError();
  }
}
