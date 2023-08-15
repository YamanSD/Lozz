import BaseModel from "./BaseModel";
import { restock } from "./types";


/**
 * Class encapsulating the restocking data.
 */
export default class Restock implements BaseModel {
  /* raw restocking data */
  private dataValue: restock;

  /**
   * @param data raw restocking data
   */
  public constructor(data: restock) {
    this.dataValue = data;
  }

  /**
   * @returns the stored raw data
   */
  public get data(): restock {
    return this.dataValue;
  }

  /**
   * @returns a list of all product USIs in the restocking
   */
  public get products() {
    return Object.keys(this.quantities);
  }

  /**
   * @param value new value of the raw data
   */
  public set data(value: restock) {
    this.dataValue = value;
  }

  /**
   * @returns the ID of the restocking
   */
  public get id() {
    return this.data.id;
  }

  /**
   * @returns the attached note to the restocking
   */
  public get note() {
    return this.data.note;
  }

  /**
   * @returns true if the restocking is for the inventory
   */
  public get to_inventory() {
    return this.data.to_inventory;
  }

  /**
   * @returns the quantities object for the restocking
   */
  public get quantities() {
    return this.data.quantities;
  }

  /**
   * Adds the given quantity to the quantity of the USI in the restocking.
   * If the resulting quantity is zero, delete the USI from the quantities.
   *
   * @param usi to add quantity for
   * @param quantity value to be added, can be negative or non-integer
   */
  public add(usi: string, quantity: number): void {
    if (!(usi in this.quantities)) {
      this.quantities[usi] = 0;
    }

    this.quantities[usi] += quantity;
    this.data.item_count += quantity;

    if (this.quantities[usi] === 0) {
      delete this.quantities[usi];
    }
  }

  /**
   * @param usi to check quantity for
   */
  public getQuantity(usi: string): number {
    if (!(usi in this.quantities)) {
      return 0;
    }

    return this.quantities[usi];
  }

  /**
   * @returns the total item count in the restocking
   */
  public get item_count() {
    return this.data.item_count;
  }

  /**
   * @returns the ID of the associated order, if any
   */
  public get order_id() {
    return this.data.order_id;
  }

  /**
   * @returns the ID of the employee that created the restocking
   */
  public get employee_id() {
    return this.data.employee_id;
  }

  /**
   * @returns true if the restocking operation can be indirectly deleted
   */
  public get deletable(): boolean {
    return this.order_id !== undefined;
  }

  /**
   * @returns the creation date of the restock
   */
  public get creationDate(): Date {
    return BaseModel.extractDate(this.id);
  }

  /**
   * @returns a deep copy of the raw data
   */
  public get dataCopy() {
    return BaseModel.copy(this.data);
  }

  /**
   * @returns a copy of the quantities, but value signs are inverse
   */
  public get negativeQuantities() {
    let result = BaseModel.deepCopy(this.quantities);

    for (let usi of Object.keys(result)) {
      result[usi] *= -1;
    }

    return result;
  }

  /**
   * @returns a copy of the object
   */
  public get copy() {
    return new Restock(this.dataCopy);
  }
}
