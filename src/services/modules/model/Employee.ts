import BaseModel from "./BaseModel";
import { employee, EmployeeRole, TrailNature, TrailType } from "./types";


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
   * @returns the date when the employee left the company
   */
  public get end_date() {
    if (BaseModel.isDeactivated(this.trail)) {
      BaseModel.extractDate(BaseModel.getLastAction(this.trail));
    } else {
      return undefined;
    }
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
   * @param value new first name of the employee
   */
  public set first_name(value) {
    this.data.first_name = value;
  }

  /**
   * @param value new middle name of the employee
   */
  public set middle_name(value) {
    this.data.middle_name = value;
  }

  /**
   * @param value new last name of the employee
   */
  public set last_name(value) {
    this.data.last_name = value;
  }

  /**
   * @param value new phone number of the employee
   */
  public set phone_number(value) {
    this.data.phone_number = value;
  }

  /**
   * @param value new email of the employee
   */
  public set email(value) {
    this.data.email = value;
  }

  /**
   * @param value new role of the employee
   */
  public set role(value) {
    this.data.role = value;
  }

  /**
   * @param value new commission percent of the employee
   */
  public set commission_percent(value) {
    if (value === undefined || value < 0 || 1 < value) {
      throw new RangeError(`Invalid commission ${value}`);
    }

    this.data.commission_percent = value;
  }

  /**
   * @param value new salary of the employee
   */
  public set salary(value) {
    this.data.salary = value;
  }

  /**
   * @param value new gender of the employee
   */
  public set gender(value) {
    this.data.gender = value;
  }

  /**
   * @param value new birthday of the employee
   */
  public set birthday(value) {
    this.data.birthday = value;
  }

  /**
   * Fires the employee from the company.
   * Role becomes past.
   * Trail stamped with deactivated.
   */
  public fire(): void {
    this.stamp(TrailNature.D);
    this.role = EmployeeRole.past;
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
    return new Employee(this.dataCopy);
  }
}
