import { MonetaryType } from "./types";


/**
 * Responsible for managing the underlying MonetaryType data.
 * Used to handle operations on monetary values.
 * Used mainly by other ModelClasses.
 */
export default class Monetary {
  /* Represents the LBP portion of the money */
  private lbpValue: number;

  /* Represents the USD portion of the money */
  private usdValue: number;

  /* USD sell to LBP rate, set by InformationPropertiesManager */
  private static sellUsdRateValue: number;

  /* USD buy to LBP rate, set by InformationPropertiesManager */
  private static buyUsdRateValue: number;

  /* Nearest decimal rounding for USD,
   *  set by InformationPropertiesManager.
   *  Must be in [0, 100].
   */
  private static roundToNearestUsdValue: number;

  /* Nearest number rounding for LBP,
   *  set by InformationPropertiesManager.
   *  Must be a positive integer that is divisible by 1_000.
   */
  private static roundToNearestLbpValue: number;

  /**
   * @param data MonetaryValue raw data.
   *
   * Values are automatically rounded based on user preferences.
   */
  public constructor(data: MonetaryType) {
    this.lbpValue = data[1];
    this.usdValue = data[0];
    this.applyRounding();
  }

  /**
   * Factory method for zero value instances.
   *
   * @returns a Monetary representing zero value.
   */
  public static get noValue(): Monetary {
    return new Monetary([0, 0]);
  }

  /**
   * @returns the nearest round value for LBP.
   */
  public static get roundLbpNumber(): number {
    return Monetary.roundToNearestLbpValue;
  }

  /**
   * @returns the nearest rounding decimal for USD.
   */
  public static get roundUsdDecimal(): number {
    return Monetary.roundToNearestUsdValue;
  }

  /**
   * @param value new number value for rounding LBP values.
   * @throws RangeError if the given value is not divisible
   *         by 1000 or less than or equal to 0.
   */
  public static set roundLbpNumber(value: number) {
    if (value % 1_000 != 0 || value <= 0) {
      throw new RangeError(
        "Rounding value must be divisible by 1000, and positive"
      );
    }

    Monetary.roundToNearestLbpValue = value;
  }

  /**
   * @param value new decimal value for rounding USD values.
   * @throws RangeError if the given value is less than 0 or
   *         greater than 100.
   */
  public static set roundUsdDecimal(value) {
    if (value < 0 || 100 < value) {
      throw new RangeError(
        "Rounding decimal must an integer between 0 and 100"
      );
    }

    Monetary.roundToNearestUsdValue = value;
  }

  /**
   * @returns the selling rate for USD.
   */
  public static get sellUsdRate(): number {
    return Monetary.sellUsdRateValue;
  }

  /**
   * @returns the buying rate for USD.
   */
  public static get buyUsdRate(): number {
    return Monetary.buyUsdRateValue;
  }

  /**
   * @param value new value of the selling USD rate.
   */
  public static set sellUsdRate(value: number) {
    Monetary.sellUsdRateValue = value;
  }

  /**
   * @param value new value of the buying USD rate.
   */
  public static set buyUsdRate(value: number) {
    Monetary.buyUsdRateValue = value;
  }

  /**
   * Applies the rounding on this instance, to USD and LBP.
   * The rounding is based on the roundLbpNumber and roundUsdDecimal.
   */
  public applyRounding(): void {
    this.lbp = Math.round(
      Math.round(this.lbp / Monetary.roundLbpNumber) * Monetary.roundLbpNumber
    );

    this.usd = Number(this.usd.toFixed(Monetary.roundUsdDecimal));
  }

  /**
   * @returns the LBP portion of the value.
   */
  public get lbp(): number {
    return this.lbpValue;
  }

  /**
   * @returns the USD portion of the value.
   */
  public get usd(): number {
    return this.usdValue;
  }

  /**
   * @param value new LBP value.
   */
  public set lbp(value: number) {
    this.lbpValue = value;
  }

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
    this.lbp += other.lbp;
    this.usd += other.usd;
    this.applyRounding();
  }

  /**
   * @param other subtracts the portions of other from this instance.
   *
   * Applies rounding after the operation to insure consistency.
   */
  public subtract(other: Monetary): void {
    this.lbp -= other.lbp;
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
    this.lbp *= value;
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
    this.lbp /= value;
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
   * @returns the LBP value as a string.
   */
  public get lbpString(): string {
    return this.lbp.toString();
  }

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
    return `(${this.usdString}, ${this.lbpString})`;
  }

  /**
   * @param lbpPortion? portion of the LBP value to transform to USD.
   *        If not given, all LBP is transformed.
   * @throws RangeError if the given portion is greater than this
   *         instance LBP value.
   *
   * Transforms the LBP of this instance into USD, according to the
   * buyUsdRate.
   */
  public transformToUsd(lbpPortion?: number): void {
    if (lbpPortion != undefined && this.lbp < lbpPortion) {
      throw new RangeError(
        `Invalid LBP portion ${lbpPortion}, 
         must be <= to stored ${this.lbp}`
      );
    } else if (lbpPortion == undefined) {
      lbpPortion = this.lbp;
    }

    this.usd += lbpPortion / Monetary.buyUsdRate;
    this.lbp -= lbpPortion;
  }

  /**
   * @param usdPortion? portion of the USD value to transform to LBP.
   *        If not given, all USD is transformed.
   * @throws RangeError if the given portion is greater than this
   *         instance USD value.
   *
   * Transforms the USD of this instance into USD, according to the
   * sellUsdRate.
   */
  public transformToLbp(usdPortion?: number): void {
    if (usdPortion != undefined && this.usd < usdPortion) {
      throw new RangeError(
        `Invalid USD portion ${usdPortion}, 
         must be <= to stored ${this.usd}`
      );
    } else if (usdPortion == undefined) {
      usdPortion = this.usd;
    }

    this.lbp += usdPortion * Monetary.sellUsdRate;
    this.usd -= usdPortion;
  }

  /**
   * @param lbpPortion? portion of the LBP value to transform to USD.
   *        If not given, all LBP is transformed.
   * @returns the transformed copy.
   *
   * Transforms the LBP of a copy of this instance into USD,
   * according to the buyUsdRate.
   */
  public transformToLbpCopy(lbpPortion?: number): Monetary {
    let temp = this.copy();

    temp.transformToLbp(lbpPortion);

    return temp;
  }

  /**
   * @param usdPortion? portion of the USD value to transform to LBP.
   *        If not given, all USD is transformed.
   * @returns the transformed copy.
   *
   * Transforms the USD of a copy of this instance into USD,
   * according to the sellUsdRate.
   */
  public transformToUsdCopy(usdPortion?: number): Monetary {
    let temp = this.copy();

    temp.transformToUsd(usdPortion);

    return temp;
  }

  /**
   * @returns the MonetaryType data of the class.
   */
  public get data(): MonetaryType {
    return [this.usd, this.lbp];
  }
}
