import BaseController, { ControllerFlag } from "./BaseController";
import { basicVendor, Generic, SpecialFields, vendor, VendorSearchSchema } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionInfo from "../../CollectionInfo";
import Vendor from "../model/Vendor";
import { NotStatisticalError } from "./Errors";
import validator from "validator";
import isEmail from "validator/lib/isEmail";
import isAlphanumeric = validator.isAlphanumeric;
import isMobilePhone = validator.isMobilePhone;


/**
 * Class responsible for handling operations on the vendors' collection.
 */
export default class VendorController extends BaseController<vendor> {
  private static readonly flag: number =
    ControllerFlag.can_update
    | ControllerFlag.has_trail
    | ControllerFlag.can_delete;

  /**
   * @param server firestore instance for the database
   */
  public constructor(server?: typeof firestore) {
    super(
      CollectionInfo.vendor.name,
      CollectionInfo.vendor.id,
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
      [SpecialFields.trail]: this.generateInitialTrail()
    });
  }

  /**
   * @param data to be fixed
   * @returns data suitable for the search engine insertion schema
   * @protected
   */
  protected fixSearchEngineData(data: vendor): Generic {
    return {
      id: data.name,
      name: data.name,
      phone_numbers: data.phone_numbers ?? [],
      emails: data.emails ?? []
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

  /**
   *
   * @param data generic data to be verified
   * @throws an error, whose message is a stringifies json object iff the
   *         validation fails. Each entry in the json is a field in the data,
   *         if marked true, indicates that the field failed.
   *         If no errors occur, no side effects.
   *         Used on creation.
   */
  protected validateCreation(data: vendor): Promise<void> | void {
    /*
     * validates the emails, phone numbers, & name.
     */
    let errorObj = {
      emails: false, // assume correct
      name: true,
      phone_numbers: false // assume correct
    };

    /* Iterate over the locales and test */
    for (const locale of CollectionInfo.locale) {
      if (errorObj.name && isAlphanumeric(data.name)) {
        errorObj.name = false;
      }
    }

    /* check phone numbers */
    for (let phone_number of data.phone_numbers ?? []) {
      if (!isMobilePhone(phone_number)) {
        errorObj.phone_numbers = true;
        break;
      }
    }

    /* check emails */
    for (let email of data.emails ?? []) {
      if (!isEmail(email)) {
        errorObj.emails = true;
        break;
      }
    }

    this.checkErrorObject(errorObj);
  }

  /**
   *
   * @param data generic data to be verified
   * @throws an error, whose message is a stringifies json object iff the
   *         validation fails. Each entry in the json is a field in the data,
   *         if marked true, indicates that the field failed.
   *         If no errors occur, no side effects.
   *         Used on update.
   */
  protected validateUpdate(data: Generic): Promise<void> | void {
    /*
     * validates the emails, phone numbers, & name.
     */
    let errorObj = {
      emails: false, // assume correct
      name: data.name !== undefined,
      phone_numbers: false // assume correct
    };

    /* check phone numbers */
    for (let phone_number of data.phone_numbers ?? []) {
      if (!isMobilePhone(phone_number)) {
        errorObj.phone_numbers = true;
        break;
      }
    }

    /* check emails */
    for (let email of data.emails ?? []) {
      if (!isEmail(email)) {
        errorObj.emails = true;
        break;
      }
    }

    this.checkErrorObject(errorObj);
  }
}
