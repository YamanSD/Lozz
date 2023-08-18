import BaseController from "./BaseController";
import CollectionInfo from "../../../CollectionInfo";
import CategoryController from "./CategoryController";
import CourierController from "./CourierController";
import CustomerController from "./CustomerController";
import EmployeeController from "./EmployeeController";
import ExpenseController from "./ExpenseController";
import InformationController from "./InformationController";
import OrderController from "./OrderController";
import ProductController from "./ProductController";
import RestockController from "./RestockController";
import VendorController from "./VendorController";


/**
 * API for the dependency tree controllers
 */
export default class DependencyTree {
  /**
   * Constructs all controllers
   */
  public static async loadControllers(): Promise<void> {
    new VendorController(CollectionInfo.server);
    new CategoryController(CollectionInfo.server);
    new CourierController(CollectionInfo.server);
    new CustomerController(CollectionInfo.server);
    new EmployeeController(CollectionInfo.server);
    new ExpenseController(CollectionInfo.server);
    new InformationController(CollectionInfo.server);
    new ProductController(CollectionInfo.server);
    new RestockController(CollectionInfo.server);
    new OrderController(CollectionInfo.server);
  }

  /**
   * @returns the vendors controller instance
   */
  public static get Vendors(): VendorController {
    const name = CollectionInfo.vendor.name;

    if (!BaseController.isDependencyPresent(name)) {
      new VendorController(CollectionInfo.server);
    }

    return BaseController.getDependency(name);
  }

  /**
   * @returns the categories controller instance
   */
  public static get Categories(): CategoryController {
    const name = CollectionInfo.category.name;

    if (!BaseController.isDependencyPresent(name)) {
      new CategoryController(CollectionInfo.server);
    }

    return BaseController.getDependency(name);
  }

  /**
   * @returns the couriers controller instance
   */
  public static get Couriers(): CourierController {
    const name = CollectionInfo.courier.name;

    if (!BaseController.isDependencyPresent(name)) {
      new CourierController(CollectionInfo.server);
    }

    return BaseController.getDependency(name);
  }

  /**
   * @returns the customers controller instance
   */
  public static get Customers(): CustomerController {
    const name = CollectionInfo.customer.name;

    if (!BaseController.isDependencyPresent(name)) {
      new CustomerController(CollectionInfo.server);
    }

    return BaseController.getDependency(name);
  }

  /**
   * @returns the employees controller instance
   */
  public static get Employees(): EmployeeController {
    const name = CollectionInfo.employee.name;

    if (!BaseController.isDependencyPresent(name)) {
      new EmployeeController(CollectionInfo.server);
    }

    return BaseController.getDependency(name);
  }

  /**
   * @returns the expenses controller instance
   */
  public static get Expenses(): ExpenseController {
    const name = CollectionInfo.expense.name;

    if (!BaseController.isDependencyPresent(name)) {
      new ExpenseController(CollectionInfo.server);
    }

    return BaseController.getDependency(name);
  }

  /**
   * @returns the information controller instance
   */
  public static get Information(): InformationController {
    const name = CollectionInfo.information.name;

    if (!BaseController.isDependencyPresent(name)) {
      new InformationController(CollectionInfo.server);
    }

    return BaseController.getDependency(name);
  }

  /**
   * @returns the orders controller instance
   */
  public static get Orders(): OrderController {
    const name = CollectionInfo.order.name;

    if (!BaseController.isDependencyPresent(name)) {
      new OrderController(CollectionInfo.server);
    }

    return BaseController.getDependency(name);
  }

  /**
   * @returns the products controller instance
   */
  public static get Products(): ProductController {
    const name = CollectionInfo.product.name;

    if (!BaseController.isDependencyPresent(name)) {
      new ProductController(CollectionInfo.server);
    }

    return BaseController.getDependency(name);
  }

  /**
   * @returns the restocks controller instance
   */
  public static get Restocks(): RestockController {
    const name = CollectionInfo.restock.name;

    if (!BaseController.isDependencyPresent(name)) {
      new RestockController(CollectionInfo.server);
    }

    return BaseController.getDependency(name);
  }
}
