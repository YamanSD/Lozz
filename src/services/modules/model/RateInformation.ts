import BaseModel from "./BaseModel";
import { Generic, information, rateInformation, TrailType } from "./types";
import { InvalidInputError } from "../controller/Errors";


/**
 * Class that encapsulates the raw data about rate information.
 * A zero value in rate sell or buy indicates that the field with the
 * zero is blocked.
 */
export default class RateInformation implements BaseModel {
  /* raw data of the rate information */
  private readonly dataValue: information;

  /* information data stored in the raw data */
  private informationValue: rateInformation;

  /**
   * @param data raw information data
   */
  public constructor(data: information) {
    this.dataValue = data;
    this.informationValue = data as Generic as rateInformation;
  }

  /**
   * @returns the USD buy rate
   */
  public get buyRate() {
    return this.information.buyUsdRate;
  }

  /**
   * @returns the USD sell rate
   */
  public get sellRate() {
    return this.information.sellUsdRate;
  }

  /**
   * @returns the nearest rounding for LBP
   */
  public get roundingLbp() {
    return this.information.roundToNearestLbp;
  }

  /**
   * @returns the nearest rounding for USD
   */
  public get roundingUsd() {
    return this.information.roundToNearestUsd;
  }

  /**
   * @param value new USD buy rate
   */
  public set buyRate(value) {
    if (value < 0) {
      throw new InvalidInputError();
    }

    this.information.buyUsdRate = value;
  }

  /**
   * @param value new USD sell rate
   */
  public set sellRate(value) {
    if (value < 0) {
      throw new InvalidInputError();
    }

    this.information.sellUsdRate = value;
  }

  /**
   * @param value new LBP rounding number
   */
  public set roundingLbp(value) {
    if (value <= 0) {
      throw new InvalidInputError();
    }

    this.information.roundToNearestLbp = value;
  }

  /**
   * @returns the type of the information
   */
  public get type() {
    return this.data.type;
  }

  /**
   * @param value new USD rounding cent
   */
  public set roundingUsd(value) {
    if (value <= 0) {
      throw new InvalidInputError();
    }

    this.information.roundToNearestUsd = value;
  }

  /**
   * @param value new rate information
   */
  public set information(value: rateInformation) {
    this.informationValue = value;
  }

  /**
   * @returns the rate information
   */
  public get information() {
    return this.informationValue;
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
   * @returns a copy of the object
   */
  public get copy(): RateInformation {
    return new RateInformation(this.dataCopy);
  }
}
