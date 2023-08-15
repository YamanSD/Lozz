import BaseController, { ControllerFlag } from "./BaseController";
import { basicVendor, vendor, VendorSearchSchema } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionNames from "./CollectionNames";
import Vendor from "../model/Vendor";


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
      this.injectDependency();
    });
  }

  /**
   * @param name of the vendor to be fetched
   * @returns Vendor data
   * @throws IdDoesNotExistError if the name does not belong to a vendor
   */
  public async get(name: string) {
    return await this.genericGet(Vendor, name);
  }

  /**
   * @param data basic raw data to create a vendor
   * @throws IdAlreadyExistsError if the name of the vendor is taken
   */
  public async create(data: basicVendor) {
    return await this.genericCreate(data, data.name);
  }

  /**
   * @param model new model of the vendor
   * @throws IdDoesNotExistError if the vendor does not exist
   */
  public async update(model: Vendor) {
    return await this.genericUpdate(model, model.name);
  }

  /**
   * @param data basic vendor data
   * @returns vendor data suitable for upload
   * @protected
   */
  protected fillDataGaps(data: basicVendor): vendor {
    return super.fixDataGaps({
      name: data.name,
      phone_numbers: data.phone_numbers,
      emails: data.emails,
      trail: this.generateInitialTrail()
    });
  }
}
