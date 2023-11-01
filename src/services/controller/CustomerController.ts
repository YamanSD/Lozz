import BaseController, { ControllerFlag } from "./BaseController";
import { basicCustomer, customer, CustomerSearchSchema, Generic, SpecialFields } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionInfo from "../../CollectionInfo";
import Customer from "../model/Customer";
import BaseModel from "../model/BaseModel";
import { NotStatisticalError } from "./Errors";
import { AlphanumericLocale } from "validator/lib/isAlphanumeric";
import validator from "validator";
import isEmail from "validator/lib/isEmail";
import { isDate } from "lodash";
import isMobilePhone = validator.isMobilePhone;
import isAlpha = validator.isAlpha;


/**
 * Class responsible for handling operations on the customers' collection.
 */
export default class CustomerController extends BaseController<customer> {
  private static readonly flag: number =
    ControllerFlag.can_update
    | ControllerFlag.has_trail;

  /**
   * @param server firestore instance for the database
   */
  public constructor(server?: typeof firestore) {
    super(
      CollectionInfo.customer.name,
      CollectionInfo.customer.id,
      server ?? firestore,
      CustomerController.flag,
      CustomerSearchSchema
    );

    this.loadSearchData().then(() => {
      this.activateListener();
      this.injectDependency();
    });
  }

  /**
   * @param phone_number of the customer to be fetched
   * @returns customer data
   * @throws IdDoesNotExistError if the phone_number does not belong to a customer
   */
  public async get(phone_number: string) {
    return await this.genericGet(Customer, phone_number);
  }

  /**
   * @param data basic raw data to create a customer
   * @throws IdAlreadyExistsError if the name of the customer is taken
   */
  public async create(data: basicCustomer) {
    return await this.genericCreate(data, data.phone_number);
  }

  /**
   * @param model new model of the customer
   * @throws IdDoesNotExistError if the customer does not exist
   */
  public async update(model: Customer) {
    return await this.genericUpdate(model, model.phone_number);
  }

  /**
   * @param customer_id to check for if is banned
   * @returns true if the customer is banned.
   *          If the customer does not exist, an error is thrown.
   */
  public async isBanned(customer_id: string): Promise<boolean> {
    return (await this.get(customer_id)).is_banned;
  }

  /**
   * @param data basic customer data
   * @returns customer data suitable for upload
   * @protected
   */
  protected fillDataGaps(data: basicCustomer): customer {
    return super.fixDataGaps({
      first_name: data.first_name,
      middle_name: data.middle_name,
      last_name: data.last_name,
      phone_number: data.phone_number,
      email: data.email,
      gender: data.gender,
      birthday: data.birthday,
      is_banned: false,
      [SpecialFields.trail]: this.generateInitialTrail()
    });
  }

  /**
   * @param data to be fixed
   * @returns data suitable for the search engine insertion schema
   * @protected
   */
  protected fixSearchEngineData(data: customer): Generic {
    return super.fixDataGaps({
      id: data.phone_number,
      first_name: data.first_name,
      middle_name: data.middle_name ?? "",
      last_name: data.last_name,
      phone_number: data.phone_number,
      email: data.email ?? "",
      gender: data.gender,
      birthday: data.birthday !== undefined
        ? BaseModel.revertDate(data.birthday)
        : undefined,
      is_banned: data.is_banned
    });
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
  protected validateCreation(data: customer): void {
    /* validates the name, phone number, email, & birthday */
    let errorObj = {
      phone_number: true,
      first_name: true,
      last_name: true,
      middle_name: data.middle_name !== undefined,
      email: data.email !== undefined,
      birthday: data.birthday !== undefined
    };

    /* Iterate over the locales and test */
    for (const locale of CollectionInfo.locale) {
      /* Check the first name */
      if (errorObj.first_name && isAlpha(data.first_name,
        locale as AlphanumericLocale, {
          ignore: " "
        })) {
        errorObj.first_name = false;
      }

      /* Check the last name */
      if (errorObj.last_name && isAlpha(data.last_name,
        locale as AlphanumericLocale, {
          ignore: " "
        })) {
        errorObj.last_name = false;
      }

      /* Check the middle name */
      if (errorObj.middle_name && isAlpha(data.middle_name as string,
        locale as AlphanumericLocale)) {
        errorObj.middle_name = false;
      }
    }

    /* Check birthday, locale-independent */
    if (errorObj.birthday && isDate(data.birthday as Date)) {
      errorObj.birthday = false;
    }

    /* check email, locale-independent */
    if (errorObj.email && isEmail(data.email as string)) {
      errorObj.email = false;
    }

    /* check phone number, locale-independent */
    if (errorObj.phone_number && isMobilePhone(data.phone_number as string)) {
      errorObj.phone_number = false;
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
  protected validateUpdate(data: Generic): void {
    /* validates the name, phone number, email, & birthday */
    let errorObj = {
      phone_number: data.phone_number !== undefined,
      first_name: data.first_name !== undefined,
      last_name: data.last_name !== undefined,
      middle_name: data.middle_name !== undefined,
      email: data.email !== undefined,
      birthday: data.birthday !== undefined
    };

    /* Iterate over the locales and test */
    for (const locale of CollectionInfo.locale) {
      /* Check the first name */
      if (errorObj.first_name && isAlpha(data.first_name,
        locale as AlphanumericLocale)) {
        errorObj.first_name = false;
      }

      /* Check the last name */
      if (errorObj.last_name && isAlpha(data.last_name,
        locale as AlphanumericLocale)) {
        errorObj.last_name = false;
      }

      /* Check the middle name */
      if (errorObj.middle_name && isAlpha(data.middle_name as string,
        locale as AlphanumericLocale)) {
        errorObj.middle_name = false;
      }
    }

    /* Check birthday, locale-independent */
    if (errorObj.birthday && isDate(data.birthday as Date)) {
      errorObj.birthday = false;
    }

    /* check email, locale-independent */
    if (errorObj.email && isEmail(data.email as string)) {
      errorObj.email = false;
    }

    this.checkErrorObject(errorObj);
  }
}
