import BaseController, { ControllerFlag } from "./BaseController";
import {
  basicExpense,
  expense,
  ExpenseSearchSchema,
  Generic,
  QuantityType,
  SpecialFields
} from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionInfo from "../../../CollectionInfo";
import Expense, { Associate } from "../model/Expense";
import BaseModel from "../model/BaseModel";
import { IdDoesNotExistError, InvalidInvoiceQuantitiesError } from "./Errors";
import ProductController from "./ProductController";
import RestockController from "./RestockController";
import EmployeeController from "./EmployeeController";
import CourierController from "./CourierController";
import VendorController from "./VendorController";
import Restock from "../model/Restock";
import Product from "../model/Product";
import Monetary from "../local_model/Monetary";


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
    const data = await this.getData(id);

    if (data === undefined) {
      throw new IdDoesNotExistError();
    }

    let associate: Associate | undefined = undefined;

    if (data.vendor_id !== undefined) {
      associate = await this.vendorController.get(data.vendor_id);
    } else if (data.employee_id !== undefined) {
      associate = await this.employeeController.get(data.employee_id);
    } else if (data.courier_id !== undefined) {
      associate = await this.courierController.get(data.courier_id);
    } else if (data.restock_id !== undefined) {
      associate = await this.restockController.get(data.restock_id);
    }

    return new Expense(data, associate);
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
   * @returns the products controller for the server,
   *          in the injected dependencies
   */
  public get productController(): ProductController {
    return BaseController.getDependency(
      CollectionInfo.product.name,
      ProductController,
      this.metaServer
    );
  }

  /**
   * @returns the restocks controller for the server,
   *          in the injected dependencies
   */
  public get restockController(): RestockController {
    return BaseController.getDependency(
      CollectionInfo.restock.name,
      RestockController,
      this.metaServer
    );
  }

  /**
   * @returns the employees controller for the server,
   *          in the injected dependencies
   */
  public get employeeController(): EmployeeController {
    return BaseController.getDependency(
      CollectionInfo.employee.name,
      EmployeeController,
      this.metaServer
    );
  }

  /**
   * @returns the couriers controller for the server,
   *          in the injected dependencies
   */
  public get courierController(): CourierController {
    return BaseController.getDependency(
      CollectionInfo.courier.name,
      CourierController,
      this.metaServer
    );
  }

  /**
   * @returns the vendors controller for the server,
   *          in the injected dependencies
   */
  public get vendorController(): VendorController {
    return BaseController.getDependency(
      CollectionInfo.vendor.name,
      VendorController,
      this.metaServer
    );
  }

  /**
   * @param quantities to be checked
   * @returns true if the quantities are valid for an invoice, otherwise false.
   */
  public static checkInvoiceQuantities(quantities: QuantityType): boolean {
    for (let quantity of Object.values(quantities)) {
      if (quantity < 0) {
        return false;
      }
    }

    return true;
  }

  /**
   * @param data of the expense invoice
   */
  public async createInvoice(data: basicExpense) {
    let restockData = data.restock_data;

    if (restockData === undefined
      || !ExpenseController.checkInvoiceQuantities(restockData.quantities)) {
      throw new InvalidInvoiceQuantitiesError();
    }

    let quantities = restockData.quantities;
    let value = Monetary.noValue();
    restockData.costs = {};

    // All keys are USIs not RUSI inventory
    for (let rusi of Object.keys(quantities)) {
      const usi = Restock.removeTag(rusi);
      const pid = Product.invertUsi(usi).id;
      const product = await this.productController.get(pid);
      let cost = product.getTotalCost(Product.usiToUsp(usi));

      restockData.costs[usi] = cost.data;

      cost.multiply(quantities[rusi]);
      value.add(cost);
    }

    restockData.id = await this.restockController.create(restockData);
    data.value = value.data;

    return await this.create(data);
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
      restock_id: data.restock_data?.id,
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
