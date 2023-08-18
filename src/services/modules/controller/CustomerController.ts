import BaseController, { ControllerFlag } from "./BaseController";
import { basicCustomer, customer, CustomerSearchSchema, SpecialFields } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionInfo from "../../../CollectionInfo";
import Customer from "../model/Customer";


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
}
