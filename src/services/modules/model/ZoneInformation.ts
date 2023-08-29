import BaseModel from "./BaseModel";
import { information, zoneInformation, TrailType, MonetaryDiscountType, MonetaryType, Generic } from "./types";
import Monetary from "../local_model/Monetary";


/**
 * Class that encapsulates the raw data about zone information.
 */
export default class ZoneInformation implements BaseModel {
  /* raw data of the zone information */
  private readonly dataValue: information;

  /* information data stored in the raw data */
  private informationValue: zoneInformation;

  /**
   * @param data raw information data
   */
  public constructor(data: information) {
    this.dataValue = data;
    this.informationValue = data as Generic as zoneInformation;
  }

  /**
   * @returns a list of zone names
   */
  public get zones() {
    return this.information.data;
  }

  /**
   * @param value new list of zones
   */
  public set zones(value) {
    this.information.data = value;
  }

  /**
   * @param value to get the shipping discount for
   * @param zone to get the shipping discount based on
   * @returns the shipping discount for the given value in the given zone
   */
  public getShippingDiscount(value: Monetary, zone: string):
    MonetaryDiscountType | MonetaryType {
    const shipping_discounts = this.zones[zone].shipping_discounts;

    if (!this.isValid(zone)
      || shipping_discounts === undefined) {
      return Monetary.noDiscount();
    }

    let boundaries = Object.keys(shipping_discounts);

    boundaries.sort((a, b) => {
      return Number(a) - Number(b);
    });

    for (let i in boundaries) {
      const bound = Number(boundaries[i]);

      if (bound <= value.usd) {
        return shipping_discounts[bound];
      }
    }

    return Monetary.noDiscount();
  }

  /**
   * @param value to get the total discount for
   * @param zone to get the total discount based on
   * @returns the total discount for the given value in the given zone
   */
  public getTotalDiscount(value: Monetary, zone: string):
    MonetaryDiscountType | MonetaryType {
    const total_discounts = this.zones[zone].total_discounts;

    if (!this.isValid(zone)
      || total_discounts === undefined) {
      return Monetary.noDiscount();
    }

    let boundaries = Object.keys(total_discounts);

    boundaries.sort((a, b) => {
      return Number(a) - Number(b);
    });

    for (let i in boundaries) {
      const bound = Number(boundaries[i]);

      if (bound <= value.usd) {
        return total_discounts[bound];
      }
    }

    return Monetary.noDiscount();
  }

  /**
   * @param value new zone information
   */
  public set information(value: zoneInformation) {
    this.informationValue = value;
  }

  /**
   * @returns the zone information
   */
  public get information() {
    return this.informationValue;
  }

  /**
   * @param zone to be checked
   * @returns true if the zone is valid
   */
  public isValid(zone: string): boolean {
    return zone in this.zones;
  }

  /**
   * @returns the trail
   */
  public get trail(): TrailType {
    return this.information.trail;
  }

  /**
   * @param value new value of the trail
   */
  public set trail(value: TrailType) {
    this.information.trail = value;
  }

  /**
   * @returns the stored raw data
   */
  public get data(): information {
    return this.dataValue;
  }

  /**
   * @returns a deep copy of the raw data
   */
  public get dataCopy() {
    return BaseModel.copy(this.data);
  }

  /**
   * @returns the type of the information
   */
  public get type() {
    return this.data.type;
  }

  /**
   * @returns a copy of the object
   */
  public get copy(): ZoneInformation {
    return new ZoneInformation(this.dataCopy);
  }
}
