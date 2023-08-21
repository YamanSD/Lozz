import BaseController, { ControllerFlag } from "./BaseController";
import { basicExpense, expense, ExpenseSearchSchema, Generic, SpecialFields } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionInfo from "../../../CollectionInfo";
import Expense from "../model/Expense";
import BaseModel from "../model/BaseModel";


/**
 * Class responsible for handling operations on the expenses' collection.
 */
export default class ExpenseController extends BaseController<expense> {
  private static readonly flag: number =
    ControllerFlag.can_delete
    | ControllerFlag.can_update
    | ControllerFlag.has_trail;

  /**
   * @param server firestore instance for the database
   */
  public constructor(server?: typeof firestore) {
    super(
      CollectionInfo.expense.name,
      CollectionInfo.expense.id,
      server ?? firestore,
      ExpenseController.flag,
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

  /**
   * @param data to be fixed
   * @returns data suitable for the search engine insertion schema
   * @protected
   */
  protected fixSearchEngineData(data: expense): Generic {
    return {
      id: data.id,
      description: data.description,
      value: data.value,
      date: BaseModel.revertDate(data.date),
      vendor_id: data.vendor_id ?? "",
      employee_id: data.employee_id ?? "",
      courier_id: data.courier_id ?? ""
    };
  }
}
