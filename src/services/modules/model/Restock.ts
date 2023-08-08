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
   * Adds the given quantity to the quantity of the USP in the restocking.
   *
   * @param usp to add quantity for
   * @param quantity value to be added
   */
  public add(usp: string, quantity: number): void {
    if (!(usp in this.quantities)) {
      this.quantities[usp] = 0;
    }

    this.quantities[usp] += quantity;
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
}
