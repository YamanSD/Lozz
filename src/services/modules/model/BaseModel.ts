/**
 * Very simple abstract class used to achieve polymorphism between the
 * other model classes.
 * To get the type of the data, use: `typeof obj.data`.
 */
export default abstract class BaseModel {
  /**
   * @returns the raw data.
   */
  public abstract get data(): any;

  /**
   * @param value new value of the raw data.
   */
  public abstract set data(value: any);
}
