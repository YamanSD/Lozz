import BaseController, { ControllerFlag } from "./BaseController";
import { basicEmployee, employee, EmployeeRole, EmployeeSearchSchema, Generic, SpecialFields } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionInfo from "../../CollectionInfo";
import Employee from "../model/Employee";
import database from "@react-native-firebase/database";
import BaseModel from "../model/BaseModel";
import { NotStatisticalError } from "./Errors";
import { AlphanumericLocale } from "validator/lib/isAlphanumeric";
import validator from "validator";
import { isDate } from "lodash";
import isEmail from "validator/lib/isEmail";
import isAlpha = validator.isAlpha;
import isMobilePhone = validator.isMobilePhone;
import isAlphanumeric = validator.isAlphanumeric;


/**
 * Class responsible for handling operations on the employees' collection.
 */
export default class EmployeeController extends BaseController<employee> {
  private static readonly flag: number =
    ControllerFlag.can_update
    | ControllerFlag.can_deactivate
    | ControllerFlag.has_trail;

  /* object containing user IDs & their status */
  private static onlineList: Generic<boolean>;

  /**
   * @param server firestore instance for the database
   */
  public constructor(server?: typeof firestore) {
    super(
      CollectionInfo.employee.name,
      CollectionInfo.employee.id,
      server ?? firestore,
      EmployeeController.flag,
      EmployeeSearchSchema
    );

    this.loadSearchData().then(() => {
      this.activateListener();
      this.injectDependency();
    });
  }

  /**
   * @returns object containing user IDs & their status
   */
  public get onlineList() {
    return EmployeeController.onlineList;
  }

  /**
   * @param id of the employee to be fetched
   * @returns employee data
   * @throws IdDoesNotExistError if the id does not belong to a employee
   */
  public async get(id: string) {
    return await this.genericGet(Employee, id);
  }

  /**
   * @param data basic raw data to create a employee
   * @throws IdAlreadyExistsError if the name of the employee is taken
   */
  public async create(data: basicEmployee) {
    return await this.genericCreate(data, data.phone_number);
  }

  /**
   * @param model new model of the employee
   * @throws IdDoesNotExistError if the employee does not exist
   */
  public async update(model: Employee) {
    return await this.genericUpdate(model, model.id);
  }

  /**
   * Activates the listener for the employee collection & employee database
   * online detection.
   * @protected
   */
  protected activateListener() {
    super.activateListener();
    database()
      .ref(`/${CollectionInfo.online_detection}/`)
      .on("value", snapshot => {
        EmployeeController.onlineList = snapshot.val();
      });
  }

  /**
   * @param data basic employee data
   * @returns employee data suitable for upload
   * @protected
   */
  protected fillDataGaps(data: basicEmployee): employee {
    return super.fixDataGaps({
      id: data.phone_number,
      first_name: data.first_name,
      middle_name: data.middle_name,
      last_name: data.last_name,
      phone_number: data.phone_number,
      email: data.email,
      role: data.role,
      commission_percent: data.commission_percent,
      salary: data.salary,
      gender: data.gender,
      birthday: data.birthday,
      join_date: new Date(),
      [SpecialFields.trail]: this.generateInitialTrail()
    });
  }

  /**
   * @param data to be fixed
   * @returns data suitable for the search engine insertion schema
   * @protected
   */
  protected fixSearchEngineData(data: employee): Generic {
    return super.fixDataGaps({
      id: data.phone_number,
      first_name: data.first_name,
      middle_name: data.middle_name ?? "",
      last_name: data.last_name,
      phone_number: data.phone_number,
      email: data.email,
      role: data.role,
      commission_percent: data.commission_percent ?? 0,
      salary: data.salary,
      gender: data.gender,
      birthday: data.birthday !== undefined
        ? BaseModel.revertDate(data.birthday)
        : undefined,
      left: data.role === EmployeeRole.past,
      join_date: BaseModel.revertDate(data.join_date)
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
  protected validateCreation(data: employee): Promise<void> | void {
    /*
     * validates the name, phone number, email, birthday, join date,
     * salary, id, & commission rate.
     */
    let errorObj = {
      id: true,
      salary: true,
      join_date: true,
      commission_percent: data.join_date !== undefined,
      phone_number: data.join_date !== undefined,
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

    /* check id, locale-independent */
    if (errorObj.id && isAlphanumeric(data.id)) {
      errorObj.id = false;
    }

    /* check salary, locale-independent */
    if (errorObj.salary && data.salary > 0) {
      errorObj.salary = false;
    }

    /* check commission, locale-independent */
    const commission = data.commission_percent as number;
    if (errorObj.commission_percent && 0 <= commission && commission <= 1) {
      errorObj.commission_percent = false;
    }

    /* Check birthday, locale-independent */
    if (errorObj.birthday && isDate(data.birthday as Date)) {
      errorObj.birthday = false;
    }

    /* Check join date, locale-independent */
    if (errorObj.join_date && isDate(data.join_date as Date)) {
      errorObj.join_date = false;
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
  protected validateUpdate(data: Generic): Promise<void> | void {
    /*
     * validates the name, phone number, email, birthday, join date,
     * salary, id, & commission rate.
     */
    let errorObj = {
      id: data.id !== undefined,
      salary: true,
      join_date: data.join_date !== undefined,
      commission_percent: data.join_date !== undefined,
      phone_number: data.join_date !== undefined,
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

    /* check salary, locale-independent */
    if (errorObj.salary && data.salary > 0) {
      errorObj.salary = false;
    }

    /* check commission, locale-independent */
    const commission = data.commission_percent as number;
    if (errorObj.commission_percent && 0 <= commission && commission <= 1) {
      errorObj.commission_percent = false;
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
}
