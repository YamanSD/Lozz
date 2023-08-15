import BaseModel from "./BaseModel";
import { information, provinceInformation, TrailType } from "./types";


/**
 * Class that encapsulates the raw data about province information.
 */
export default class ProvinceInformation implements BaseModel {
  /* raw data of the province information */
  private readonly dataValue: information;

  /* information data stored in the raw data */
  private informationValue: provinceInformation;

  /**
   * @param data raw information data
   */
  public constructor(data: information) {
    this.dataValue = data;
    this.informationValue = data.data as provinceInformation;
  }

  /**
   * @returns a list of province names
   */
  public get provinces() {
    return this.information.names;
  }

  /**
   * @param value new list of provinces
   */
  public set provinces(value) {
    this.information.names = value;
  }

  /**
   * @param value new province information
   */
  public set information(value: provinceInformation) {
    this.informationValue = value;
  }

  /**
   * @returns the province information
   */
  public get information() {
    return this.informationValue;
  }

  /**
   * @param province to be checked
   * @returns true if the province is valid
   */
  public isValid(province: string): boolean {
    return this.provinces.indexOf(province) !== -1;
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
  public get copy(): ProvinceInformation {
    return new ProvinceInformation(this.dataCopy);
  }
}
