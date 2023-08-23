import BaseModel from "./BaseModel";
import { restock, TrailType } from "./types";


/**
 * Class encapsulating the restocking data.
 */
export default class Restock implements BaseModel {
  /* raw restocking data */
  private dataValue: restock;

  /*
   * if present at the end of a RUSI, indicates that quantity
   * if for inventory
   */
  private static INVENTORY_FLAG: string = "_INV";

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
   * @param rusi to be converted
   * @returns the USI of the RUSI
   */
  public static removeTag(rusi: string): string {
    return this.isToInventory(rusi)
      ? rusi.replace(Restock.INVENTORY_FLAG, "")
      : rusi;
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
   * @returns the quantities object for the restocking
   */
  public get quantities() {
    return this.data.quantities;
  }

  /**
   * @param rusi to check
   * @returns true if the RUSI is for the inventory
   */
  public static isToInventory(rusi: string): boolean {
    return rusi.endsWith(Restock.INVENTORY_FLAG);
  }

  /**
   * @param value new quantities
   */
  public set quantities(value) {
    this.data.quantities = value;
  }

  /**
   * @returns the inventory flag
   */
  public get inventory_flag() {
    return Restock.INVENTORY_FLAG;
  }

  /**
   * @param usi to generate the RUSI for
   * @param to_inventory true indicates that the USI is for inventory
   * @returns the RUSI
   */
  public static getRusi(usi: string, to_inventory: boolean) {
    return usi + (to_inventory ? Restock.INVENTORY_FLAG : "")
  }

  /**
   * @param rusi to be converted
   * @param to_inventory destination
   * @returns USI or RUSI depending on the input
   */
  public static convert(rusi: string, to_inventory: boolean) {
    if (Restock.isToInventory(rusi)) {
      return to_inventory ? rusi : Restock.removeTag(rusi);
    } else {
      return to_inventory ? Restock.getRusi(rusi, true) : rusi;
    }
  }

  /**
   * Adds the given quantity to the quantity of the USI in the restocking.
   * If the resulting quantity is zero, delete the USI from the quantities.
   *
   * @param usi to add quantity for
   * @param quantity value to be added, can be negative or non-integer
   * @param to_inventory if true, the quantity is targeted to the inventory
   */
  public add(usi: string, quantity: number, to_inventory: boolean): void {
    const rusi = Restock.getRusi(usi, to_inventory);

    if (!(rusi in this.quantities)) {
      this.quantities[rusi] = 0;
    }

    this.quantities[rusi] += quantity;
    this.item_count += Math.abs(quantity);

    if (this.quantities[rusi] === 0) {
      delete this.quantities[rusi];
    }
  }

  /**
   * @param rusi to check quantity for
   * @returns the quantity of the RUSI
   */
  public getQuantity(rusi: string): number {
    if (!(rusi in this.quantities)) {
      return 0;
    }

    return this.quantities[rusi];
  }

  /**
   * @param usi to get quantity for
   * @param to_inventory source of quantity
   * @returns the quantity of the USI in the given source
   */
  public getUsiQuantity(usi: string, to_inventory: boolean) {
    return this.getQuantity(Restock.getRusi(usi, to_inventory))
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
