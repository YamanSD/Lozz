import BaseController, { ControllerFlag } from "./BaseController";
import { basicEmployee, employee, EmployeeSearchSchema, SpecialFields } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionNames from "./CollectionNames";
import Employee from "../model/employee";


export default class EmployeeController extends BaseController<employee> {
  private static readonly flag: number =
    ControllerFlag.can_update
    | ControllerFlag.has_trail;

  /**
   * @param server firestore instance for the database
   */
  public constructor(server?: typeof firestore) {
    super(
      CollectionNames.employee.name,
      CollectionNames.employee.id,
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
      orders: [],
      join_date: new Date(),
      [SpecialFields.trail]: this.generateInitialTrail()
    });
  }
}
