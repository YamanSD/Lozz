import BaseModel from "./BaseModel";
import { TrailNature, TrailType, vendor } from "./types";


/**
 * Class encapsulating the vendor data.
 */
export default class Vendor implements BaseModel {
  /* raw vendor data */
  private dataValue: vendor;

  /**
   * @param data raw vendor data
   */
  public constructor(data: vendor) {
    this.dataValue = data;
  }

  /**
   * @returns the stored raw data
   */
  public get data(): vendor {
    return this.dataValue;
  }

  /**
   * @param value new value of the raw data
   */
  public set data(value: vendor) {
    this.dataValue = value;
  }

  /**
   * @returns the ID of the vendor
   */
  public get id() {
    return this.data.id;
  }

  /**
   * @returns the name of the vendor
   */
  public get name() {
    return this.data.name;
  }

  /**
   * @returns list of phone numbers of the vendor or undefined if it does
   *          not exist
   */
  public get phone_numbers() {
    return this.data.phone_numbers;
  }

  /**
   * @returns list of emails of the vendor or undefined if it does not exist
   */
  public get emails() {
    return this.data.emails;
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
   * @param value new name of the vendor
   */
  public set name(value) {
    this.data.name = value;
  }

  /**
   * @param value new list of phone numbers for the vendor
   */
  public set phone_numbers(value) {
    this.data.phone_numbers = value;
  }

  /**
   * @param value new list of emails for the vendor
   */
  public set emails(value) {
    this.data.emails = value;
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
    return new Vendor(this.dataCopy);
  }
}
