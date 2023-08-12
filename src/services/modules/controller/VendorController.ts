import BaseController, { ControllerFlag } from "./BaseController";
import { TrailNature, vendor, VendorSearchSchema } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionNames from "./CollectionNames";
import Vendor from "../model/Vendor";
import { NoDataError } from "./Errors";
import BaseModel from "../model/BaseModel";


export type vendorInput = {
  name: string,
  phone_numbers?: [...string[]],
  emails?: [...string[]]
};

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
      CollectionNames.vendor,
      server ?? firestore,
      VendorController.flag,
      VendorSearchSchema
    );

    this.loadSearchData().then(() => {
      this.activateListener();
    });
  }

  public setCache(id: string, data: vendor): void {
    this.updateSearchEngine(data).then(() => {
      super.setCache(id, data);
    });
  }

  public async get(id: string) {
    const data = await this.getDocument(id);

    if (data === undefined) {
      throw new NoDataError();
    }

    return new Vendor(data);
  }

  public async create(data: vendorInput) {
    const finalData = {
      ...data,
      trail: {}
    };

    BaseModel.stamp(finalData.trail, TrailNature.C);

    return await this.createServer(finalData as vendor);
  }
}
