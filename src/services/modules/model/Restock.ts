import BaseModel from "./BaseModel";
import { restock, TrailType } from "./types";


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
   * @param value new quantities
   */
  public set quantities(value) {
    this.data.quantities = value;
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
    this.item_count += Math.abs(quantity);

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
   * @param value new value of the item count
   */
  public set item_count(value) {
    this.data.item_count = value;
  }

  /**
   * @returns true if the restocking is linked to an order
   */
  public get order_linked() {
    return this.data.order_linked ?? false;
  }

  /**
   * @returns true if the restocking belongs to a canceled order
   */
  public get forCanceledOrder() {
    return BaseModel.isDeactivated(this.trail);
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
   * @returns the trail
   */
  public get trail(): TrailType {
    return this.data.trail;
  }

  /**
   * @param value new to inventory value
   */
  public set to_inventory(value: boolean | undefined) {
    this.data.to_inventory = value;
  }

  /**
   * @param value new value of the trail
   */
  public set trail(value: TrailType) {
    this.data.trail = value;
  }

  /**
   * @returns a copy of the object
   */
  public get copy() {
    return new Restock(this.dataCopy);
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
