import BaseController, { ControllerFlag, Generic } from "./BaseController";
import { basicExpense, expense, ExpenseSearchSchema } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionNames from "./CollectionNames";
import Expense from "../model/expense";
import { IdDoesNotExistError } from "./Errors";
import { isEqual } from "lodash";
import BaseModel from "../model/BaseModel";


export default class expenseController extends BaseController<expense> {
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
      expenseController.flag,
      ExpenseSearchSchema
    );

    this.loadSearchData().then(() => {
      this.activateListener();
    });
  }

  /**
   * @param name of the expense to be fetched
   * @returns expense data
   * @throws IdDoesNotExistError if the name does not belong to an expense
   */
  public async get(name: string) {
    const data = await this.getData(name);

    if (data === undefined) {
      throw new IdDoesNotExistError();
    }

    return new Expense(data);
  }

  /**
   * @param data basic raw data to create an expense
   * @throws IdAlreadyExistsError if the name of the expense is taken
   */
  public async create(data: basicExpense) {
    await this.createServer(BaseModel.getRandomTimestamp(2),
      this.fillDataGaps(data));
    await this.uploadIds();
  }

  /**
   * @param model new model of the expense
   * @throws IdDoesNotExistError if the expense does not exist
   */
  public async update(model: Expense) {
    if (await this.isIdAvailable(model.id)) {
      throw new IdDoesNotExistError();
    }

    const currentData: Generic | undefined = this.getCache(model.id);
    const data: Generic | undefined = model.data;

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
   * @param data basic expense data
   * @returns expense data suitable for upload
   * @protected
   */
  protected fillDataGaps(data: basicExpense): expense {
    return super.fillDataGaps({
      description: data.description,
      value: data.value,
      date: data.date,
      vendor_id: data.vendor_id,
      employee_id: data.employee_id,
      courier_id: data.courier_id,
      trail: this.generateInitialTrail()
    });
  }
}
