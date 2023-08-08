import BaseModel from "./BaseModel";
import { customer, TrailNature, TrailType } from "./types";


/**
 * Class encapsulating the customer data.
 */
export default class Customer implements BaseModel {
  /* raw data of the customer */
  private dataValue: customer;

  /**
   * @param data raw data of the customer
   */
  public constructor(data: customer) {
    this.dataValue = data;
  }

  /**
   * @returns the stored raw data
   */
  public get data(): customer {
    return this.dataValue;
  }

  /**
   * @param value new value of the raw data
   */
  public set data(value: customer) {
    this.dataValue = value;
  }

  /**
   * @returns the ID of the customer
   */
  public get id() {
    return this.data.id;
  }

  /**
   * @returns the registered first name of the customer
   */
  public get first_name() {
    return this.data.first_name;
  }

  /**
   * @returns the registered middle name of the customer,
   *          if it exists. Otherwise, undefined
   */
  public get middle_name() {
    return this.data.middle_name;
  }

  /**
   * @returns the registered last name of the customer
   */
  public get last_name() {
    return this.data.last_name;
  }

  /**
   * @returns the registered phone number of the customer, if exists.
   *          Otherwise, undefined
   */
  public get phone_number() {
    return this.data.phone_number;
  }

  /**
   * @returns the registered email of the customer, if exists.
   *          Otherwise, undefined
   */
  public get email() {
    return this.data.email;
  }

  /**
   * @returns the gender of the customer
   */
  public get gender() {
    return this.data.gender;
  }

  /**
   * @returns the birthday of the customer
   */
  public get birthday() {
    return this.data.birthday;
  }

  /**
   * @returns the age of the customer in years if they have a birthday.
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
   * @returns the full name of the customer
   */
  public get full_name() {
    return [
      this.first_name,
      this.middle_name ?? '',
      this.last_name
    ].join(' ');
  }

  /**
   * @returns boolean representing whether the customer is banned
   */
  public get is_banned() {
    return this.data.is_banned;
  }

  /**
   * @returns the list of orders created by the customer
   */
  public get orders() {
    return this.data.orders;
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
   * @param value new first name of the customer
   */
  public set first_name(value) {
    this.data.first_name = value;
  }

  /**
   * @param value new middle name of the customer
   */
  public set middle_name(value) {
    this.data.middle_name = value;
  }

  /**
   * @param value new last name of the customer
   */
  public set last_name(value) {
    this.data.last_name = value;
  }

  /**
   * @param value new phone number of the customer
   */
  public set phone_number(value) {
    this.data.phone_number = value;
  }

  /**
   * @param value new email of the customer
   */
  public set email(value) {
    this.data.email = value;
  }

  /**
   * @param value new gender of the customer
   */
  public set gender(value) {
    this.data.gender = value;
  }

  /**
   * @param value new birthday of the customer
   */
  public set birthday(value) {
    this.data.birthday = value;
  }

  /**
   * @param value new orders of the customer
   */
  public set orders(value) {
    this.data.orders = value;
  }

  /**
   * @param value user becomes banned or unbanned
   */
  public set is_banned(value) {
    this.data.is_banned = value;
  }

  /**
   * @param id appended to the list of orders
   */
  public appendOrder(id: string) {
    if (this.orders === undefined) {
      this.orders = [];
    }

    this.orders.push(id);
  }

  /**
   * @param id removes from the list of orders
   */
  public removeOrder(id: string) {
    if (this.orders === undefined) {
      return;
    }

    const index = this.orders.indexOf(id);

    if (-1 < index) {
      this.orders.splice(index, 1);
    }
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
}
