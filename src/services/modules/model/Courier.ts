import BaseModel from "./BaseModel";
import { courier, TrailNature, TrailType, MonetaryType } from "./types";
import Monetary from "../local_model/Monetary";
import { NoZonesError } from "../controller/Errors";
import ZoneInformation from "./ZoneInformation";
import ProvinceInformation from "./ProvinceInformation";
import { isNumber } from "lodash";


/**
 * Class encapsulating the courier data.
 */
export default class Courier implements BaseModel {
  /* raw data of the courier */
  private dataValue: courier;

  /* zone information object */
  private static zonesObject: ZoneInformation;

  /* province information object */
  private static provincesObject: ProvinceInformation;

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
   * @returns the zone set
   */
  public static get zones() {
    return Courier.zonesObject;
  }

  /**
   * @param value of the new zone set
   */
  public static set zones(value) {
    Courier.zonesObject = value;
  }

  /**
   * @returns the provinces object
   */
  public static get provinces() {
    return Courier.provincesObject;
  }

  /**
   * @param value new province object value
   */
  public static set provinces(value) {
    Courier.provincesObject = value;
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
   * @param value value of the order to calculate the shipping fees for
   * @param zone zone to get shipping fees for
   * @throws Error if the given zone is not in the courier shipping fees
   *         object
   * @returns the Monetary value of the shipping fees
   */
  public getShippingFees(value: Monetary, zone: string): Monetary {
    if (!Courier.isValidZone(zone)) {
      throw new Error(`Invalid zone ${zone} with courier ${this.name}`);
    }

    let result = new Monetary(this.shipping_fees[zone]);
    const discount = Courier.zones.getShippingDiscount(value, zone);

    if (isNumber(discount)) { // MonetaryType
      result.add(new Monetary(discount as MonetaryType));
    } else {
      result.applyDiscount(discount);
    }

    return result;
  }

  /**
   * @param zone to be checked
   * @returns true if the zone is valid
   * @throws NoZonesError if there are no zones
   */
  public static isValidZone(zone: string) {
    if (Courier.zones === undefined) {
      throw new NoZonesError();
    }

    return zone in Courier.zones.zones;
  }

  /**
   * @param zone to be added to the shipping fees
   * @param value new shipping fee of the zone
   */
  public setShippingFees(zone: string, value: Monetary): void {
    if (!Courier.isValidZone(zone)) {
      throw new Error(`Invalid zone does not exist`);
    }

    this.shipping_fees[zone] = value.data;
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
