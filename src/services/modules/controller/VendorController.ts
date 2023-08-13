import BaseController, { ControllerFlag, Generic } from "./BaseController";
import { basicVendor, vendor, VendorSearchSchema } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionNames from "./CollectionNames";
import Vendor from "../model/Vendor";
import { IdAlreadyExistsError, IdDoesNotExistError } from "./Errors";


export default class VendorController extends BaseController<vendor> {
  private static readonly flag: number =
    ControllerFlag.can_deactivate
    | ControllerFlag.can_update
    | ControllerFlag.has_trail
    | ControllerFlag.can_delete;

  /**
   * @param server firestore instance for the database
   */
  public constructor(server?: typeof firestore) {
    super(
      CollectionNames.vendor.name,
      CollectionNames.vendor.id,
      server ?? firestore,
      VendorController.flag,
      VendorSearchSchema
    );

    this.loadSearchData().then(() => {
      this.activateListener();
    });
  }

  public async get(id: string) {
    const data = await this.getData(id);

    if (data === undefined) {
      throw new IdDoesNotExistError();
    }

    return new Vendor(data);
  }

  public async create(data: basicVendor) {
    if (!(await this.isIdAvailable(data.name))) {
      throw new IdAlreadyExistsError();
    }

    await this.createServer(data.name, this.fillDataGaps(data));
    await this.uploadIds();
  }

  public async update(model: Vendor) {
    if (await this.isIdAvailable(model.name)) {
      throw new IdDoesNotExistError();
    }

    const currentData: Generic | undefined = this.getCache(model.name);
    const data: Generic | undefined = model.data;

    if (currentData === undefined) {
      await this.updateServer(data, model.name);
      return;
    }

    for (let key of Object.keys(currentData)) {
      if (currentData[key] === data[key] || data[key] === undefined) {
        delete data[key];
      }
    }

    await this.updateServer(data, model.name);
  }

  protected fillDataGaps(data: basicVendor): vendor {
    return super.fillDataGaps({
      name: data.name,
      phone_numbers: data.phone_numbers,
      emails: data.emails,
      trail: this.generateInitialTrail()
    });
  }
}
