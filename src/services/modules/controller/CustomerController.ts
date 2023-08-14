import BaseController, { ControllerFlag, Generic } from "./BaseController";
import { basicCustomer, customer, CustomerSearchSchema } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionNames from "./CollectionNames";
import Customer from "../model/customer";
import { IdAlreadyExistsError, IdDoesNotExistError } from "./Errors";
import { isEqual } from "lodash";


export default class CustomerController extends BaseController<customer> {
  private static readonly flag: number =
    ControllerFlag.can_update
    | ControllerFlag.has_trail;

  /**
   * @param server firestore instance for the database
   */
  public constructor(server?: typeof firestore) {
    super(
      CollectionNames.customer.name,
      CollectionNames.customer.id,
      server ?? firestore,
      CustomerController.flag,
      CustomerSearchSchema
    );

    this.loadSearchData().then(() => {
      this.activateListener();
    });
  }

  /**
   * @param phone_number of the customer to be fetched
   * @returns customer data
   * @throws IdDoesNotExistError if the phone_number does not belong to a customer
   */
  public async get(phone_number: string) {
    const data = await this.getData(phone_number);

    if (data === undefined) {
      throw new IdDoesNotExistError();
    }

    return new Customer(data);
  }

  /**
   * @param data basic raw data to create a customer
   * @throws IdAlreadyExistsError if the name of the customer is taken
   */
  public async create(data: basicCustomer) {
    if (!(await this.isIdAvailable(data.phone_number))) {
      throw new IdAlreadyExistsError();
    }

    await this.createServer(data.phone_number, this.fillDataGaps(data));
    await this.uploadIds();
  }

  /**
   * @param model new model of the customer
   * @throws IdDoesNotExistError if the customer does not exist
   */
  public async update(model: Customer) {
    if (await this.isIdAvailable(model.phone_number)) {
      throw new IdDoesNotExistError();
    }

    const currentData: Generic | undefined = this.getCache(model.phone_number);
    const data: Generic | undefined = model.data;

    if (currentData === undefined) {
      await this.updateServer(data, model.phone_number);
      return;
    }

    for (let key of Object.keys(currentData)) {
      if (isEqual(currentData[key], data[key]) || data[key] === undefined) {
        delete data[key];
      }
    }

    await this.updateServer(data, model.phone_number);
  }

  /**
   * @param data basic customer data
   * @returns customer data suitable for upload
   * @protected
   */
  protected fillDataGaps(data: basicCustomer): customer {
    return super.fillDataGaps({
      first_name: data.first_name,
      middle_name: data.middle_name,
      last_name: data.last_name,
      phone_number: data.phone_number,
      email: data.email,
      gender: data.gender,
      birthday: data.birthday,
      is_banned: false,
      orders: [],
      trail: this.generateInitialTrail()
    });
  }
}
