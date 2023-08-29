import { MonetaryDiscountType, MonetaryType } from "../model/types";
import { isInteger } from "lodash";
// import RateInformation from "../model/RateInformation";


/**
 * Responsible for managing the underlying MonetaryType data.
 * Used to handle operations on monetary values.
 * Used mainly by other ModelClasses.
 */
export default class Monetary {
  // /* Represents the LBP portion of the money */
  // private lbpValue: number;

  /* Represents the USD portion of the money */
  private usdValue: number;

  // /* object containing all the information about currency conversion */
  // private static ratesObject: RateInformation;

  /**
   * @param data MonetaryValue raw data.
   *
   * Values are automatically rounded based on user preferences.
   */
  public constructor(data: MonetaryType) {
    // this.lbpValue = data[1];
    this.usdValue = data;
    this.applyRounding();
  }

  /**
   * Factory method for zero value instances.
   *
   * @returns a Monetary representing zero value.
   */
  public static noValue(): Monetary {
    return new Monetary(0);
  }

  /**
   * Factory method for zero value discount instances.
   *
   * @returns a Monetary discount of zero.
   */
  public static noDiscount(): MonetaryDiscountType {
    return {
      usd: 0,
      // lbp: 0
    };
  }

  /**
   * @param value discount object to be applied
   */
  public applyDiscount(value: MonetaryDiscountType) {
    this.usd *= 1 - value.usd;
    // this.lbp *= 1 - value.lbp;
    this.applyRounding();
  }

  // /**
  //  * @returns the rates object
  //  */
  // public static get rates() {
  //   return Monetary.ratesObject;
  // }

  // /**
  //  * @param value new rates object
  //  */
  // public static set rates(value) {
  //   Monetary.ratesObject = value;
  // }

  // /**
  //  * @returns the nearest round value for LBP.
  //  */
  // public static get roundLbpNumber(): number {
  //   return Monetary.rates.roundingLbp;
  // }
  //
  /**
   * @returns the nearest rounding number for USD.
   */
  public static get roundUsdNumber(): number {
    // return Monetary.rates.roundingUsd;
    return 0.01;
  }
  //
  // /**
  //  * @returns the selling rate for USD.
  //  */
  // public static get sellUsdRate(): number {
  //   return Monetary.rates.sellRate;
  // }
  //
  // /**
  //  * @returns the buying rate for USD.
  //  */
  // public static get buyUsdRate(): number {
  //   return Monetary.rates.buyRate;
  // }

  /**
   * @param value to be rounded
   * @param roundingValue nearest-to rounding value
   * @private
   */
  private static round(value: number, roundingValue: number): number {
    if (roundingValue <= 0) {
      return value;
    }

    const result = Math.round(value / roundingValue) * roundingValue;
    const degree = Math.abs(Math.floor(Math.log10(roundingValue % 1)));

    return isInteger(roundingValue)
      ? Math.round(result)
      : Number(result.toFixed(degree));
  }

  /**
   * Applies the rounding on this instance, to USD and LBP.
   * The rounding is based on the roundLbpNumber and roundUsdNumber.
   */
  public applyRounding(): void {
    // this.lbp = Monetary.round(this.lbp, Monetary.roundLbpNumber);
    this.usd = Monetary.round(this.usd, Monetary.roundUsdNumber);
  }

  // /**
  //  * @returns the LBP portion of the value.
  //  */
  // public get lbp(): number {
  //   return this.lbpValue;
  // }

  /**
   * @returns the USD portion of the value.
   */
  public get usd(): number {
    return this.usdValue;
  }

  // /**
  //  * @param value new LBP value.
  //  */
  // public set lbp(value: number) {
  //   this.lbpValue = value;
  // }

  /**
   * @param value new USD value.
   */
  public set usd(value: number) {
    this.usdValue = value;
  }

  /**
   * @param other adds the portions of other to this instance.
   *
   * Applies rounding after the operation to insure consistency.
   */
  public add(other: Monetary): void {
    // this.lbp += other.lbp;
    this.usd += other.usd;
    this.applyRounding();
  }

  /**
   * @param other subtracts the portions of other from this instance.
   *
   * Applies rounding after the operation to insure consistency.
   */
  public subtract(other: Monetary): void {
    // this.lbp -= other.lbp;
    this.usd -= other.usd;
    this.applyRounding();
  }

  /**
   * @param value multiply both USD and LBP of
   *        this instance by given value.
   *
   * Applies rounding after the operation to insure consistency.
   */
  public multiply(value: number): void {
    // this.lbp *= value;
    this.usd *= value;
    this.applyRounding();
  }

  /**
   * @param value divide both USD and LBP of
   *        this instance by given value.
   *
   * Applies rounding after the operation to insure consistency.
   */
  public divide(value: number): void {
    // this.lbp /= value;
    this.usd /= value;
    this.applyRounding();
  }

  /**
   * @returns a copy of this instance.
   */
  public copy(): Monetary {
    return new Monetary(this.data);
  }

  /**
   * @param other adds the portions of other to a copy of this instance.
   * @returns the copy.
   *
   * Applies rounding after the operation to insure consistency.
   */
  public addCopy(other: Monetary): Monetary {
    let temp = this.copy();
    temp.add(other);

    return temp;
  }

  /**
   * @param other subtracts the portions of other from
   *        a copy of this instance.
   * @returns the copy.
   *
   * Applies rounding after the operation to insure consistency.
   */
  public subtractCopy(other: Monetary): Monetary {
    let temp = this.copy();
    temp.subtract(other);

    return temp;
  }

  /**
   * @param value multiply both USD and LBP of
   *        a copy of this instance by given value.
   * @returns the copy.
   *
   * Applies rounding after the operation to insure consistency.
   */
  public multiplyCopy(value: number): Monetary {
    let temp = this.copy();
    temp.multiply(value);

    return temp;
  }

  /**
   * @param value divide both USD and LBP of
   *        a copy of this instance by given value.
   * @returns the copy.
   *
   * Applies rounding after the operation to insure consistency.
   */
  public divideCopy(value: number): Monetary {
    let temp = this.copy();
    temp.divide(value);

    return temp;
  }

  /**
   * @param discount amount deducted from this instance.
   * @returns MonetaryDiscountType instance
   */
  public discountPercent(discount: Monetary): MonetaryDiscountType {
    return this.subtractCopy(discount).percent(this);
  }

  /**
   * @param other value to compare against.
   * @returns what percentage is this instance of the given instance.
   */
  public percent(other: Monetary) {
    return {
      usd: other.usd / this.usd,
      // lbp: other.lbp / this.lbp
    };
  }

  // /**
  //  * @returns the LBP value as a string.
  //  */
  // public get lbpString(): string {
  //   return this.lbp.toString();
  // }

  /**
   * @returns the USD value as a string.
   */
  public get usdString(): string {
    return this.usd.toString();
  }

  /**
   * @returns the string representation of this instance,
   *          in the form (USD, LBP).
   *
   * Used mostly for debugging and logging.
   */
  public toString(): string {
    // return `(${this.usdString}, ${this.lbpString})`;
    return `$${this.usdString}`;
  }

  // /**
  //  * @param lbpPortion? portion of the LBP value to transform to USD.
  //  *        If not given, all LBP is transformed.
  //  * @throws RangeError if the given portion is greater than this
  //  *         instance LBP value.
  //  *
  //  * Transforms the LBP of this instance into USD, according to the
  //  * buyUsdRate.
  //  */
  // public transformToUsd(lbpPortion?: number): void {
    // if (lbpPortion != undefined && this.lbp < lbpPortion) {
    //   throw new RangeError(
    //     `Invalid LBP portion ${lbpPortion},
    //      must be <= to stored ${this.lbp}`
    //   );
    // } else if (lbpPortion == undefined) {
    //   lbpPortion = this.lbp;
    // }
    //
    // this.usd += lbpPortion / Monetary.buyUsdRate;
    // this.lbp -= lbpPortion;
  // }

  // /**
  //  * @param usdPortion? portion of the USD value to transform to LBP.
  //  *        If not given, all USD is transformed.
  //  * @throws RangeError if the given portion is greater than this
  //  *         instance USD value.
  //  *
  //  * Transforms the USD of this instance into USD, according to the
  //  * sellUsdRate.
  //  */
  // public transformToLbp(usdPortion?: number): void {
  //   if (usdPortion != undefined && this.usd < usdPortion) {
  //     throw new RangeError(
  //       `Invalid USD portion ${usdPortion},
  //        must be <= to stored ${this.usd}`
  //     );
  //   } else if (usdPortion == undefined) {
  //     usdPortion = this.usd;
  //   }
  //
  //   this.lbp += usdPortion * Monetary.sellUsdRate;
  //   this.usd -= usdPortion;
  // }

  // /**
  //  * @param lbpPortion? portion of the LBP value to transform to USD.
  //  *        If not given, all LBP is transformed.
  //  * @returns the transformed copy.
  //  *
  //  * Transforms the LBP of a copy of this instance into USD,
  //  * according to the buyUsdRate.
  //  */
  // public transformToLbpCopy(lbpPortion?: number): Monetary {
  //   let temp = this.copy();
  //
  //   temp.transformToLbp(lbpPortion);
  //
  //   return temp;
  // }

  // /**
  //  * @param usdPortion? portion of the USD value to transform to LBP.
  //  *        If not given, all USD is transformed.
  //  * @returns the transformed copy.
  //  *
  //  * Transforms the USD of a copy of this instance into USD,
  //  * according to the sellUsdRate.
  //  */
  // public transformToUsdCopy(usdPortion?: number): Monetary {
  //   let temp = this.copy();
  //
  //   temp.transformToUsd(usdPortion);
  //
  //   return temp;
  // }

  /**
   * @param other Monetary value to compare against
   * @return true if the given monetary value is less than the current one,
   *         after converting both to USD.
   */
  public lessThan(other: Monetary): boolean {
    // return this.transformToUsdCopy().usd < other.transformToUsdCopy().usd;
    return this.usd < other.usd;
  }

  /**
   * @param value of the percentage of discount [0, 1]
   *
   * Applies the discount percent on the values of this instance
   */
  public applyDiscountPercent(value: number): void {
    if (value < 0 || 1 < value) {
      throw new EvalError("Invalid discount");
    }

    this.multiply(1 - value);
  }

  /**
   * @param value of the percentage of discount [0, 1]
   *
   * Applies the discount percent on the values of a copy of
   * this instance.
   */
  public applyDiscountPercentCopy(value: number): Monetary {
    let temp = this.copy();
    temp.applyDiscountPercent(value);

    return temp;
  }

  /**
   * @returns true if the USD is negative or the LBP is negative
   */
  public get isNegative(): boolean {
    // return this.usd < 0 || this.lbp < 0;
    return this.usd < 0;
  }

  /**
   * @returns the MonetaryType data of the class.
   */
  public get data(): MonetaryType {
    // return [this.usd, this.lbp];
    return this.usd;
  }
}
