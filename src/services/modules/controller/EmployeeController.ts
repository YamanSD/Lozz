import BaseController, { ControllerFlag } from "./BaseController";
import { basicEmployee, employee, EmployeeRole, EmployeeSearchSchema, Generic, SpecialFields } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionInfo from "../../../CollectionInfo";
import Employee from "../model/Employee";
import database from "@react-native-firebase/database";
import BaseModel from "../model/BaseModel";


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
   * Activates the listener for the employee collection & employee database
   * online detection.
   * @protected
   */
  protected activateListener() {
    super.activateListener();
    database()
      .ref(`/${CollectionInfo.online_detection}/`)
      .on('value', snapshot => {
        EmployeeController.onlineList = snapshot.val();
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
}
