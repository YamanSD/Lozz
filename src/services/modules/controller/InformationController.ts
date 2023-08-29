import BaseController, { ControllerFlag } from "./BaseController";
import { basicProperties, Generic, information, InformationType } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionInfo from "../../../CollectionInfo";
import { IdDoesNotExistError, IllegalStateError, NotStatisticalError } from "./Errors";
import RateInformation from "../model/RateInformation";
import ProvinceInformation from "../model/ProvinceInformation";
import ZoneInformation from "../model/ZoneInformation";
import { isEqual } from "lodash";
import Courier from "../model/Courier";
import Monetary from "../local_model/Monetary";


/**
 * Alias for all information models
 */
export type InformationModels =
  RateInformation | ProvinceInformation | ZoneInformation;

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
      this.updateModels().then(() => {
        this.activateListener();
        this.injectDependency();
      });
    });
  }

  /**
   * Updates all model information from cache
   * @private
   */
  private async updateModels() {
    for (let [_, type] of Object.entries(InformationType)) {
      this.updateModel(type, (await this.get(type)).data);
    }
  }

  /**
   * Updates the model information.
   *
   * @param type of the information
   * @param data of the information
   * @private
   */
  private updateModel(type: string, data: information) {
    if (type === InformationType.zones) {
      Courier.zones = new ZoneInformation(data);
    } else if (type === InformationType.rate) {
      Monetary.rates = new RateInformation(data);
    } else if (type === InformationType.provinces) {
      Courier.provinces = new ProvinceInformation(data);
    }
  }

  /**
   * Activates the listener for the collection.
   * Handles update processing between documents.
   *
   * @private
   */
  protected activateListener() {
    this.collection.onSnapshot(snapshot => {
      snapshot.docChanges().forEach(async (change) => {
        const document = change.doc;
        const id = document.id;

        if (change.type === "added") {
          if (this.checkCache(id)) {
            return;
          }

          const data = document.data() as information;

          await this.setCache(id, data as information);
          this.updateModel(id, data);
        } else if (change.type === "modified") {
          const data = document.data() as information;

          await this.updateCache(id, data);
          this.updateModel(id, data);
        } else if (change.type === "removed") {
          this.removeCache(id);
        }
      });
    });
  }

  /**
   * Note that this function is called only once by layer-2
   *
   * @param data to be created
   */
  public async create(data: basicProperties) {
    /* Create basic provinces */
    await this.createServer(InformationType.provinces, {
      type: InformationType.provinces,
      data: CollectionInfo.provinces
    });

    for (let [_, type] of Object.entries(InformationType)) {
      if (type === InformationType.provinces) {
        continue;
      }

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
  public async get(type: InformationType): Promise<InformationModels> {
    const data = await this.getData(type);

    if (data === undefined) {
      throw new IdDoesNotExistError();
    }

    switch (type) {
      case InformationType.provinces:
        return new ProvinceInformation(data);
      case InformationType.rate:
        return new RateInformation(data);
      case InformationType.zones:
        return new ZoneInformation(data);
    }
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
   * @returns the zone information object
   */
  public async getZones(): Promise<ZoneInformation> {
    return await this.get(InformationType.zones) as ZoneInformation;
  }

  /**
   * @param data to be fixed
   * @throws IllegalStateError
   * @protected
   */
  protected fillDataGaps(data: Generic): information {
    throw new IllegalStateError();
  }

  /**
   * @param data to be fixed
   * @returns data suitable for the search engine insertion schema
   * @protected
   */
  protected fixSearchEngineData(data: information): Generic {
    throw new IllegalStateError();
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
