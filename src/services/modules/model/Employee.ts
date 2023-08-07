import BaseModel from "./BaseModel";
import { employee, TrailType } from "./types";


/**
 * Class encapsulating the employee data.
 */
export default class Employee implements BaseModel {
  /* raw data of the employee */
  private dataValue: employee;

  /**
   * @param data raw data of the employee
   */
  public constructor(data: employee) {
    this.dataValue = data;
  }

  /**
   * @returns the stored raw data
   */
  public get data(): employee {
    return this.dataValue;
  }

  /**
   * @param value new value of the raw data
   */
  public set data(value: employee) {
    this.dataValue = value;
  }

  /**
   * @returns the ID of the employee
   */
  public get id() {
    return this.data.id;
  }

  /**
   * @returns the registered first name of the employee
   */
  public get first_name() {
    return this.data.first_name;
  }

  /**
   * @returns the registered middle name of the employee,
   *          if it exists. Otherwise, undefined
   */
  public get middle_name() {
    return this.data.middle_name;
  }

  /**
   * @returns the registered last name of the employee
   */
  public get last_name() {
    return this.data.last_name;
  }

  /**
   * @returns the registered phone number of the employee, if exists.
   *          Otherwise, undefined
   */
  public get phone_number() {
    return this.data.phone_number;
  }

  /**
   * @returns the registered email of the employee, if exists.
   *          Otherwise, undefined
   */
  public get email() {
    return this.data.email;
  }

  /**
   * @returns the registered role of the employee
   */
  public get role() {
    return this.data.role;
  }

  /**
   * @returns the commission percentage of the employee
   */
  public get commission_percent() {
    return this.data.commission_percent;
  }

  /**
   * @returns the salary of the employee
   */
  public get salary() {
    return this.data.salary;
  }

  /**
   * @returns the gender of the employee
   */
  public get gender() {
    return this.data.gender;
  }

  /**
   * @returns the birthday of the employee
   */
  public get birthday() {
    return this.data.birthday;
  }

  /**
   * @returns the age of the employee in years if they have a birthday.
   *          Otherwise, undefined.
   */
  public get age(): number | undefined {
    if (this.birthday === undefined) {
      return undefined;
    }

    // Convert milliseconds to years, then floor the result
    return Math.floor((
      new Date().getTime() - this.birthday.getTime()
    ) / 31_536_000_000);
  }

  /**
   * @returns the list of orders created by the employee
   */
  public get orders() {
    return this.data.orders;
  }

  /**
   * @returns the date when the employee left the company
   */
  public get end_date() {
    return this.data.end_date;
  }

  /**
   * @returns the full name of the employee
   */
  public get full_name() {
    return [
      this.first_name,
      this.middle_name ?? '',
      this.last_name
    ].join(' ');
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
}
