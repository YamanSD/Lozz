import BaseController, { ControllerFlag } from "./BaseController";
import { basicExpense, expense, ExpenseSearchSchema, Generic, QuantityType, SpecialFields } from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionInfo from "../../CollectionInfo";
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
import StatisticsBlock from "../local_model/StatisticsBlock";
import { AlphanumericLocale } from "validator/lib/isAlphanumeric";
import { isDate } from "lodash";
import validator from "validator";
import isAlphanumeric = validator.isAlphanumeric;
import isBefore = validator.isBefore;


/**
 * Class responsible for handling operations on the expenses' collection.
 */
export default class ExpenseController extends BaseController<expense> {
  private static readonly flag: number =
    ControllerFlag.can_delete
    | ControllerFlag.can_update
    | ControllerFlag.has_trail
    | ControllerFlag.statistical;

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

    this.loadSearchData().then(async () => {
      this.activateListener();
      this.injectDependency();
      await this.loadStatistics();
    });
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

  /**
   * @param id of the expense to be inserted to statistics
   * @protected
   */
  protected async insertStatistic(id: string): Promise<void> {
    StatisticsBlock.addExpense(await this.get(id));
  }

  /**
   * @param id of the expense to be removed to statistics
   * @protected
   */
  protected async removeStatistic(id: string): Promise<void> {
    StatisticsBlock.subtractExpense(await this.get(id));
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
  protected async validateCreation(data: expense): Promise<void> {
    /*
     * validates the id, date, description, and the associated ID if present.
     */
    let errorObj = {
      id: true,
      date: true,
      description: true,
      vendor_id: data.vendor_id !== undefined,
      restock_id: data.restock_id !== undefined,
      courier_id: data.courier_id !== undefined,
      employee_id: data.employee_id !== undefined
    };

    /* Iterate over the locales and test */
    for (const locale of CollectionInfo.locale) {
      if (errorObj.description && isAlphanumeric(data.description,
        locale as AlphanumericLocale, {
          ignore: BaseController.alphanumericIgnoreSeq
        })) {
        errorObj.description = false;
      }
    }

    /* check id, locale-independent */
    if (errorObj.id && isAlphanumeric(data.id)) {
      errorObj.id = false;
    }

    /* check date, locale-independent */
    if (errorObj.date && isDate(data.date)
      && isBefore(data.date.toString(), new Date().toString())) {
      errorObj.date = false;
    }

    /* check for the associate ID, locale-independent */
    if (data.vendor_id) {
      if (!(await this.vendorController.isIdAvailable(data.vendor_id))) {
        errorObj.vendor_id = false;
      }
    } else if (data.restock_id) {
      if (!(await this.restockController.isIdAvailable(data.restock_id))) {
        errorObj.restock_id = false;
      }
    } else if (data.courier_id) {
      if (!(await this.courierController.isIdAvailable(data.courier_id))) {
        errorObj.courier_id = false;
      }
    } else if (data.employee_id) {
      if (!(await this.employeeController.isIdAvailable(data.employee_id))) {
        errorObj.employee_id = false;
      }
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
  protected async validateUpdate(data: Generic): Promise<void> {
    /*
     * validates the id, date, description, and the associated ID if present.
     */
    let errorObj = {
      id: data.id !== undefined,
      date: data.date !== undefined,
      description: true,
      vendor_id: data.vendor_id !== undefined,
      restock_id: data.restock_id !== undefined,
      courier_id: data.courier_id !== undefined,
      employee_id: data.employee_id !== undefined
    };

    /* Iterate over the locales and test */
    for (const locale of CollectionInfo.locale) {
      if (errorObj.description && isAlphanumeric(data.description,
        locale as AlphanumericLocale, {
          ignore: " _,.[]()-+=$#@%&><:;'\"?!"
        })) {
        errorObj.description = false;
      }
    }

    /* check date, locale-independent */
    if (errorObj.date && isDate(data.date)
      && isBefore(data.date.toString(), new Date().toString())) {
      errorObj.date = false;
    }

    this.checkErrorObject(errorObj);
  }

  /**
   * Loads the expenses into the statistics iff the operation has not been done
   * @private
   */
  private async loadStatistics(): Promise<void> {
    if (StatisticsBlock.isLoaded(this.collectionName)) {
      return;
    }

    for (let id of this.idSet) {
      StatisticsBlock.addExpense(await this.get(id));
    }

    StatisticsBlock.setLoaded(this.collectionName);
  }
}
