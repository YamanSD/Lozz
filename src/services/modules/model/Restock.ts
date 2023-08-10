import BaseModel from "./BaseModel";
import { restock } from "./types";
import Product from "./Product";


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
   * @param usi to be converted
   * @returns the wholesale version of a USI
   */
  public static usiToWholesale(usi: string): string {
    return usi + Product.WHOLESALE_TAG;
  }

  /**
   * @param wholesale_usi wholesale version of a USI
   * @returns the original USI
   */
  public static extractUsi(wholesale_usi: string): string {
    return wholesale_usi.replace(Product.WHOLESALE_TAG, "");
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
   * Adds the given quantity to the quantity of the USI in the restocking.
   * If the resulting quantity is zero, delete the USI from the quantities.
   *
   * @param usi to add quantity for
   * @param quantity value to be added, can be negative or non-integer
   * @param is_wholesale true indicates that the USI is for a wholesale product
   */
  public add(usi: string, quantity: number, is_wholesale?: boolean): void {
    if (is_wholesale) {
      usi = Restock.usiToWholesale(usi);
    }

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
   * @param is_wholesale true indicates that the USI is for a wholesale product
   */
  public getQuantity(usi: string, is_wholesale?: boolean): number {
    if (is_wholesale) {
      usi = Restock.usiToWholesale(usi);
    }

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
   * @returns a deep copy of the raw data
   */
  public get dataCopy() {
    return BaseModel.copy(this.data);
  }

  /**
   * @returns a copy of the object
   */
  public get copy() {
    return new Restock(this.dataCopy);
  }
}
