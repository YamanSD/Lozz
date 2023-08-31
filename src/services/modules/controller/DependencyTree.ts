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
   * Constructs all controllers.
   * Note that will not initialize all controllers immediately.
   */
  public static async loadControllers(): Promise<void> {
    new VendorController(CollectionInfo.server);
    new CategoryController(CollectionInfo.server);
    new ProductController(CollectionInfo.server);
    new CourierController(CollectionInfo.server);
    new CustomerController(CollectionInfo.server);
    new EmployeeController(CollectionInfo.server);
    new ExpenseController(CollectionInfo.server);
    new InformationController(CollectionInfo.server);
    new RestockController(CollectionInfo.server);
    new OrderController(CollectionInfo.server);
  }

  /**
   * @returns the vendors controller instance
   */
  public static get Vendors(): VendorController {
    return BaseController.getDependency(
      CollectionInfo.vendor.name,
      VendorController,
      CollectionInfo.server
    );
  }

  /**
   * @returns the categories controller instance
   */
  public static get Categories(): CategoryController {
    return BaseController.getDependency(
      CollectionInfo.category.name,
      CategoryController,
      CollectionInfo.server
    );
  }

  /**
   * @returns the couriers controller instance
   */
  public static get Couriers(): CourierController {
    return BaseController.getDependency(
      CollectionInfo.courier.name,
      CourierController,
      CollectionInfo.server
    );
  }

  /**
   * @returns the customers controller instance
   */
  public static get Customers(): CustomerController {
    return BaseController.getDependency(
      CollectionInfo.customer.name,
      CustomerController,
      CollectionInfo.server
    );
  }

  /**
   * @returns the employees controller instance
   */
  public static get Employees(): EmployeeController {
    return BaseController.getDependency(
      CollectionInfo.employee.name,
      EmployeeController,
      CollectionInfo.server
    );
  }

  /**
   * @returns the expenses controller instance
   */
  public static get Expenses(): ExpenseController {
    return BaseController.getDependency(
      CollectionInfo.expense.name,
      ExpenseController,
      CollectionInfo.server
    );
  }

  /**
   * @returns the information controller instance
   */
  public static get Information(): InformationController {
    return BaseController.getDependency(
      CollectionInfo.information.name,
      InformationController,
      CollectionInfo.server
    );
  }

  /**
   * @returns the orders controller instance
   */
  public static get Orders(): OrderController {
    return BaseController.getDependency(
      CollectionInfo.order.name,
      OrderController,
      CollectionInfo.server
    );
  }

  /**
   * @returns the products controller instance
   */
  public static get Products(): ProductController {
    return BaseController.getDependency(
      CollectionInfo.product.name,
      ProductController,
      CollectionInfo.server
    );
  }

  /**
   * @returns the restocks controller instance
   */
  public static get Restocks(): RestockController {
    return BaseController.getDependency(
      CollectionInfo.restock.name,
      RestockController,
      CollectionInfo.server
    );
  }
}
