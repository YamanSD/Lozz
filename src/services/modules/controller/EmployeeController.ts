import BaseController, { ControllerFlag, Generic } from "./BaseController";
import { basicEmployee, employee, EmployeeSearchSchema } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionNames from "./CollectionNames";
import Employee from "../model/employee";
import { IdAlreadyExistsError, IdDoesNotExistError } from "./Errors";
import { isEqual } from "lodash";


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
   * @param phone_number of the employee to be fetched
   * @returns employee data
   * @throws IdDoesNotExistError if the phone_number does not belong to a employee
   */
  public async get(phone_number: string) {
    const data = await this.getData(phone_number);

    if (data === undefined) {
      throw new IdDoesNotExistError();
    }

    return new Employee(data);
  }

  /**
   * @param data basic raw data to create a employee
   * @throws IdAlreadyExistsError if the name of the employee is taken
   */
  public async create(data: basicEmployee) {
    if (!(await this.isIdAvailable(data.phone_number))) {
      throw new IdAlreadyExistsError();
    }

    await this.createServer(data.phone_number, this.fillDataGaps(data));
    await this.uploadIds();
  }

  /**
   * @param model new model of the employee
   * @throws IdDoesNotExistError if the employee does not exist
   */
  public async update(model: Employee) {
    if (await this.isIdAvailable(model.id)) {
      throw new IdDoesNotExistError();
    }

    const currentData: Generic | undefined = this.getCache(model.id);
    const data: Generic | undefined = model.dataCopy;

    if (currentData === undefined) {
      await this.updateServer(data, model.id);
      return;
    }

    for (let key of Object.keys(currentData)) {
      if (isEqual(currentData[key], data[key]) || data[key] === undefined) {
        delete data[key];
      }
    }

    await this.updateServer(data, model.id);
  }

  /**
   * @param data basic employee data
   * @returns employee data suitable for upload
   * @protected
   */
  protected fillDataGaps(data: basicEmployee): employee {
    return super.fillDataGaps({
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
      trail: this.generateInitialTrail()
    });
  }
}
