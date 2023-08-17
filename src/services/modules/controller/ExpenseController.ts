import BaseController, { ControllerFlag } from "./BaseController";
import { basicExpense, expense, ExpenseSearchSchema, SpecialFields } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionNames from "./CollectionNames";
import Expense from "../model/expense";
import BaseModel from "../model/BaseModel";


export default class RxpenseController extends BaseController<expense> {
  private static readonly flag: number =
    ControllerFlag.can_delete
    | ControllerFlag.can_update
    | ControllerFlag.has_trail;

  /**
   * @param server firestore instance for the database
   */
  public constructor(server?: typeof firestore) {
    super(
      CollectionNames.expense.name,
      CollectionNames.expense.id,
      server ?? firestore,
      RxpenseController.flag,
      ExpenseSearchSchema
    );

    this.loadSearchData().then(() => {
      this.activateListener();
      this.injectDependency();
    });
  }

  /**
   * @param id of the expense to be fetched
   * @returns expense data
   * @throws IdDoesNotExistError if the id does not belong to an expense
   */
  public async get(id: string) {
    return await this.genericGet(Expense, id);
  }

  /**
   * @param data basic raw data to create an expense
   * @throws IdAlreadyExistsError if the name of the expense is taken
   */
  public async create(data: basicExpense) {
    const id = BaseModel.getRandomTimestamp(2);
    await this.genericCreate(data, id);
    return id;
  }

  /**
   * @param model new model of the expense
   * @throws IdDoesNotExistError if the expense does not exist
   */
  public async update(model: Expense) {
    return await this.genericUpdate(model, model.id);
  }

  /**
   * @param data basic expense data
   * @returns expense data suitable for upload
   * @protected
   */
  protected fillDataGaps(data: basicExpense): expense {
    return super.fixDataGaps({
      description: data.description,
      value: data.value,
      date: data.date,
      vendor_id: data.vendor_id,
      employee_id: data.employee_id,
      courier_id: data.courier_id,
      [SpecialFields.trail]: this.generateInitialTrail()
    });
  }
}
