import BaseModel from "./BaseModel";
import Monetary from "./Monetary";
import { category, TrailNature, TrailType } from "./types";


/**
 * Class encapsulating the category data.
 */
export default class Category implements BaseModel {
  /* raw data of the category */
  private dataValue: category;

  /**
   * @param data raw data of the category
   */
  public constructor(data: category) {
    this.dataValue = data;
  }

  /**
   * @returns the stored raw data
   */
  public get data(): category {
    return this.dataValue;
  }

  /**
   * @param value new value of the raw data
   */
  public set data(value: category) {
    this.dataValue = value;
  }

  /**
   * @returns the name of the category
   */
  public get name() {
    return this.data.name;
  }

  /**
   * @returns the option keys of the category, if they exist.
   *          Otherwise, undefined.
   */
  public get option_keys() {
    return this.data.option_keys;
  }

  /**
   * @returns the option sets of the category, if they exist.
   *          Otherwise, undefined.
   */
  public get option_sets() {
    return this.data.option_sets;
  }

  /**
   * @returns the added price object
   */
  public get added_price() {
    return this.data.added_price;
  }

  /**
   * @param usp represents the added price on the USP for all the category.
   * @returns the added Monetary value on the given USP iff
   *          there are added prices and the USP is in them.
   *          Otherwise, returns a zero monetary value.
   */
  public addedPrice(usp: string): Monetary {
    if (this.added_price === undefined ||
        !(usp in this.added_price)) {
      return Monetary.noValue();
    }

    return new Monetary(this.added_price[usp]);
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
   * @param value new name of the category
   */
  public set name(value) {
    this.data.name = value;
  }

  /**
   * @param value new added prices object for the category
   */
  public set added_price(value) {
    this.data.added_price = value;
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
   * @param nature type of action done by the current employee
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
    return new Category(this.dataCopy);
  }
}
