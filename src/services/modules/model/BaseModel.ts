import auth from '@react-native-firebase/auth';
import { TrailNature, TrailType } from "./types";
import { cloneDeep } from "lodash";
import { reduxStorage } from "../../../store";


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

  /**
   * @returns the current datetime in the following format (yyyymmddhhMMssnnn)
   */
  public static get currentTimestamp(): string {
    const temp = new Date();

    return [
      temp.getFullYear(),
      temp.getMonth().toString().padStart(2, '0'),
      temp.getDate().toString().padStart(2, '0'),
      temp.getHours().toString().padStart(2, '0'),
      temp.getMinutes().toString().padStart(2, '0'),
      temp.getSeconds().toString().padStart(2, '0'),
      temp.getMilliseconds().toString().padStart(3, '0')
    ].join('');
  }

  /**
   * @param n number of random digits
   * @returns a string containing n random digits
   */
  public static getRandomNumber(n: number): string {
    return Math.round(Math.random() * (10 ** n)).toString();
  }

  /**
   * @param digits number of random digits at the end, zero by default
   */
  public static getRandomTimestamp(digits: number = 0): string {
    return `${BaseModel.currentTimestamp}${BaseModel.getRandomNumber(digits)}`;
  }

  /**
   * @returns the ID of the current employee if logged in, otherwise undefined
   */
  public static get currentEmployee() {
    return auth().currentUser?.uid
  }

  /**
   * @param trail trail to be stamped
   * @param nature nature of the action
   * @param randomDigits number of random digits to be appended
   *
   * Used to update trails
   */
  public static stamp(trail: TrailType,
                      nature: TrailNature,
                      randomDigits: number = 0): void {
    let id = BaseModel.currentEmployee;

    if (id === undefined) {
      if (reduxStorage.getItem("Testing")) {
        id = "TESTING_ID";
      } else {
        throw new Error("Guest user cannot stamp");
      }
    }

    trail[BaseModel.getRandomTimestamp(randomDigits)] = {
      nature: nature,
      employee_id: id
    }
  }

  /**
   * @param id that has the form yyyymmddhhMMssnnnd*
   * @returns the date in the ID
   */
  public static extractDate(id: string): Date {
    const year = Number.parseInt(id.substring(0, 4)),
      month = Number.parseInt(id.substring(4, 6)),
      day = Number.parseInt(id.substring(6, 8)),
      hour = Number.parseInt(id.substring(8, 10)),
      minute = Number.parseInt(id.substring(10, 12)),
      second = Number.parseInt(id.substring(12, 14)),
      millis = Number.parseInt(id.substring(14, 17));

    return new Date(year, month, day, hour, minute, second, millis);
  }

  /**
   * @param data to be copied
   * @returns a deep copy of the data
   */
  public static deepCopy<T>(data: T): T {
    return cloneDeep(data);
  }

  /**
   * @param data to be copied
   * @returns a deep copy of the data
   */
  public static copy<T>(data: T): T {
    return BaseModel.deepCopy(data);
  }

  /**
   * @param trail to get the last action for
   * @returns the last action's information
   */
  public static getLastAction(trail: TrailType): string {
    return Object.keys(trail).reduce(
      (a, b) => a > b ? a : b
    );
  }

  /**
   * @returns a copy of the raw data
   */
  public abstract get dataCopy(): any;
}
