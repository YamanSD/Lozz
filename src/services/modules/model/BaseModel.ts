import { TrailNature, TrailType } from "./types";


/**
 * Very simple abstract class used to achieve polymorphism between the
 * other model classes.
 * To get the type of the data, use: `typeof obj.data`.
 */
export default abstract class BaseModel {
  /**
   * @returns the raw data
   */
  public abstract get data(): any;

  /**
   * @param value new value of the raw data
   */
  public abstract set data(value: any);

  /**
   * @param trail to check if it is deactivated
   * @returns whether the object is deactivated
   */
  public static isDeactivated(trail: TrailType): boolean {
    let timestamps = Object.keys(trail);

    timestamps.sort();

    return trail[timestamps[timestamps.length - 1]].nature === TrailNature.D;
  }

  /**
   * @param trail to check if it is deleted
   * @returns whether the object is deleted
   */
  public static isDeleted(trail: TrailType): boolean {
    let timestamps = Object.keys(trail);

    timestamps.sort();

    return trail[timestamps[timestamps.length - 1]].nature === TrailNature.E;
  }
}
