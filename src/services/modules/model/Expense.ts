import BaseModel from "./BaseModel";
import Courier from "./Courier";
import Employee from "./Employee";
import Monetary from "../local_model/Monetary";
import Vendor from "./Vendor";
import { expense, TrailNature, TrailType } from "./types";
import Restock from "./Restock";


/* Type of the instance given to the expense */
export type Associate = Employee | Vendor | Courier | Restock;

/**
 * Class encapsulating the expense data.
 */
export default class Expense implements BaseModel {
  /* raw data of the expense */
  private dataValue: expense;

  /* represents the vendor of the expense */
  private associate?: Associate;

  /**
   * @param data raw data of the expense
   * @param associate either an employee, a vendor, or a courier, depending
   *        on the given associate ID in the raw data
   */
  public constructor(data: expense,
                     associate?: Associate) {
    Expense.checkAssociate(data, associate);

    this.dataValue = data;
    this.associate = associate;
  }

  /**
   * @param data raw expense data
   * @param associate potential associate
   * @throws Error instance if the data and the associate are incompatible
   * @private
   */
  private static checkAssociate(data: expense,
                                associate?: Associate): void {
    /*
     * Each checks whether the data has a reference
     * to a vendor, employee, and a courier
     */
    const to_vendor = data.vendor_id !== undefined,
          to_employee = data.employee_id !== undefined,
          to_courier = data.courier_id !== undefined;

    // True means the expense is associated with an instance
    const is_associated = to_courier || to_employee || to_vendor;

    /*
     * Each checks whether the data has a reference exclusively to
     * a vendor, an employee, or a courier
     */
    const valid_vendor = to_vendor && !(to_employee || to_courier),
          valid_employee = to_employee && !(to_vendor || to_courier),
          valid_courier = to_courier && !(to_employee || to_vendor);

    if ((associate === undefined && is_associated)
      || (associate instanceof Employee && !valid_employee)
      || (associate instanceof Vendor && !valid_vendor)
      || (associate instanceof Courier && !valid_courier)) {
      throw new Error(
        `Invalid expense instance linkage, 
        typeof associate: ${typeof associate}, 
        validity (E, V, C): (${valid_employee}, ${valid_vendor}, ${valid_courier}), 
        data: ${data}`
      );
    }
  }

  /**
   * @returns the stored raw data
   */
  public get data(): expense {
    return this.dataValue;
  }

  /**
   * @param value new value of the raw data
   */
  public set data(value: expense) {
    this.dataValue = value;
  }

  /**
   * @returns the ID of the expense
   */
  public get id() {
    return this.data.id;
  }

  /**
   * @returns the description of the expense
   */
  public get description() {
    return this.data.description;
  }

  /**
   * @returns the value of the expense
   */
  public get value() {
    return new Monetary(this.data.value);
  }

  /**
   * @returns the date of the expense
   */
  public get date() {
    return BaseModel.convertTimestamp(this.data.date);
  }

  /**
   * @returns the employee related with the expense if linked,
   *          otherwise undefined
   */
  public get employee(): Employee | undefined {
    return this.is_employee ? this.associate as Employee : undefined;
  }

  /**
   * @returns the courier related with the expense if linked,
   *          otherwise undefined
   */
  public get courier(): Courier | undefined {
    return this.is_courier ? this.associate as Courier : undefined;
  }

  /**
   * @returns the vendor related with the vendor if linked,
   *          otherwise undefined
   */
  public get vendor(): Vendor | undefined {
    return this.is_vendor ? this.associate as Vendor : undefined;
  }

  public get restock(): Restock | undefined {
    return this.is_invoice ? this.associate as Restock : undefined;
  }

  /**
   * @returns the trail
   */
  public get trail(): TrailType {
    return this.data.trail;
  }

  /**
   * @param value new value of the trail
   */
  public set trail(value: TrailType) {
    this.data.trail = value;
  }

  /**
   * @param value new description of the expense
   */
  public set description(value) {
    this.data.description = value;
  }

  /**
   * @param value new value of the expense
   * @throws Error if the value is negative (USD or LBP)
   */
  public set value(value) {
    if (value.isNegative) {
      throw new EvalError(
        // `Invalid expense monetary value USD: ${value.usd}, LBP: ${value.lbp}`
        `Invalid expense monetary value USD: ${value.usd}`
      );
    }

    this.data.value = value.data;
  }

  /**
   * @param value new date of the expense
   */
  public set date(value) {
    this.data.date = value;
  }

  /**
   * @param value new employee of the expense
   * @throws EvalError if the expense is not employee linked
   * @throws EvalError if the value is undefined
   */
  public set employee(value) {
    if (this.is_employee) {
      this.associate = value;

    } else if (value === undefined) {
      throw new EvalError("Invalid employee value for expense, undefined");
    } else {
      throw new EvalError("Associate is not employee");
    }
  }

  /**
   * @param value new courier of the expense
   * @throws EvalError if the expense is not courier linked
   * @throws EvalError if the value is undefined
   */
  public set courier(value) {
    if (this.is_courier) {
      this.associate = value;
    } else if (value === undefined) {
      throw new EvalError("Invalid courier value for expense, undefined");
    } else {
      throw new EvalError("Associate is not courier");
    }
  }

  /**
   * @param value new vendor of the expense
   * @throws EvalError if the expense is not vendor linked
   * @throws EvalError if the value is undefined
   */
  public set vendor(value) {
    if (this.is_vendor) {
      this.associate = value;
    } else if (value === undefined) {
      throw new EvalError("Invalid vendor value for expense, undefined");
    } else {
      throw new EvalError("Associate is not vendor");
    }
  }

  /**
   * @returns true if the expense is employee linked
   */
  public get is_employee(): boolean {
    return this.associate instanceof Employee;
  }

  /**
   * @returns true if the expense is vendor linked
   */
  public get is_vendor(): boolean {
    return this.associate instanceof Vendor;
  }

  /**
   * @returns true if the expense is courier linked
   */
  public get is_courier(): boolean {
    return this.associate instanceof Courier;
  }

  /**
   * @returns true if the expense is an invoice
   */
  public get is_invoice(): boolean {
    return this.associate instanceof Restock;
  }

  /**
   * @returns whether the object is deactivated
   */
  public get isDeactivated(): boolean {
    return BaseModel.isDeactivated(this.trail);
  }

  /**
   * @returns whether the object is deleted
   */
  public get isDeleted(): boolean {
    return BaseModel.isDeleted(this.trail);
  }

  /**
   * @param nature type of action done by the employee
   */
  public stamp(nature: TrailNature): void {
    BaseModel.stamp(this.trail, nature);
  }

  /**
   * @returns a deep copy of the raw data
   */
  public get dataCopy() {
    return BaseModel.copy(this.data);
  }

  /**
   * @returns a copy of the object
   */
  public get copy() {
    return new Expense(this.dataCopy, this.associate);
  }
}

