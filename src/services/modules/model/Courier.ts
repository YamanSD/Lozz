import BaseModel from "./BaseModel";
import { courier, TrailNature, TrailType } from "./types";
import Monetary from "./Monetary";


/**
 * Class encapsulating the courier data.
 */
export default class Courier implements BaseModel {
  /* raw data of the courier */
  private dataValue: courier;

  /**
   * @param data raw data of the courier
   */
  public constructor(data: courier) {
    this.dataValue = data;
  }

  /**
   * @returns the stored raw data
   */
  public get data(): courier {
    return this.dataValue;
  }

  /**
   * @param value new value of the raw data
   */
  public set data(value: courier) {
    this.dataValue = value;
  }

  /**
   * @returns the name of the courier
   */
  public get name() {
    return this.data.name;
  }

  /**
   * @returns the shipping fees object
   */
  public get shipping_fees() {
    return this.data.shipping_fees;
  }

  /**
   * @returns list of order IDs that are at the courier
   */
  public get orders() {
    return this.data.orders;
  }

  /**
   * @param province province to get shipping fees for
   * @throws Error if the given province is not in the courier shipping fees
   *         object
   * @returns the Monetary value of the shipping fees
   */
  public getShippingFees(province: string): Monetary {
    if (!(province in this.shipping_fees)) {
      throw new Error(`Invalid province ${province} with courier ${this.name}`);
    }

    return new Monetary(this.shipping_fees[province]);
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
   * @param value new name of the courier
   */
  public set name(value) {
    this.data.name = value;
  }

  /**
   * @param value new value for the shipping fees
   */
  public set shipping_fees(value) {
    this.data.shipping_fees = value;
  }

  /**
   * @param value new value of the orders array
   */
  public set orders(value) {
    this.data.orders = value;
  }

  /**
   * @param id appended to the orders array
   */
  public appendOrder(id: string) {
    this.orders.push(id);
  }

  /**
   * @param id of the order to be removed
   */
  public remove_order(id: string) {
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
    return new Courier(this.dataCopy);
  }
}
