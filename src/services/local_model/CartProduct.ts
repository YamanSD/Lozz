import Category from "../model/Category";
import Vendor from "../model/Vendor";
import Monetary from "./Monetary";
import { cartProduct } from "../model/types";


/**
 * Used to handle the raw data of cart products.
 * These are not stored on server, they are only temporary.
 */
export default class CartProduct {
  /* raw data of the cart product */
  private dataValue: cartProduct;

  /* category instance representing the category of the product */
  private readonly categoryInstance: Category;

  /* vendor instance representing the vendor of the cart product */
  private readonly vendorInstance: Vendor;

  /* true allows the cart product to have negative quantity */
  private readonly allow_negatives: boolean;

  constructor(data: cartProduct,
              category: Category,
              vendor: Vendor,
              allow_negatives?: boolean) {
    this.dataValue = data;
    this.categoryInstance = category;
    this.vendorInstance = vendor;
    this.allow_negatives = allow_negatives ?? false;
  }

  /**
   * @returns the raw data of the cart product
   */
  public get data() {
    return this.dataValue;
  }

  /**
   * @param value new raw data of the cart product
   */
  public set data(value) {
    this.dataValue = value;
  }

  /**
   * @returns the chosen USI of the cart product
   */
  public get usi() {
    return this.data.usi;
  }

  /**
   * @returns the name of the product
   */
  public get name() {
    return this.data.name;
  }

  /**
   * @returns the image URL if present of the product
   */
  public get image() {
    return this.data.image;
  }

  /**
   * @returns the current quantity of the cart product
   */
  public get quantity() {
    return this.data.quantity;
  }

  /**
   * @param value new quantity of the product
   *
   * If the new value exceeds the maximum, maximum is set.
   * If the new value is negative and negatives are not allowed,
   * zero is set.
   */
  public set quantity(value) {
    this.data.quantity = value < 0 && !this.allow_negatives
      ? 0
      : (value <= this.maxQuantity ? value : this.maxQuantity);
  }

  /**
   * @returns the total unit price of the cart product
   */
  public get total_price() {
    return new Monetary(this.data.total_price);
  }

  /**
   * @returns the discount percentages object applied on the price,
   *          prior to the creation of the cart product
   */
  public get discount() {
    return this.data.discount;
  }

  /**
   * @returns the description of the product
   */
  public get description() {
    return this.data.description;
  }

  /**
   * @returns the increment of the quantity on each add or remove operation
   */
  public get increment() {
    return this.data.increment;
  }

  /**
   * @returns the maximum possible quantity of the cart product
   */
  public get maxQuantity(): number {
    return this.data.max_quantity ? this.data.max_quantity : Number.MAX_VALUE;
  }

  /**
   * @returns the total cost of the cart product
   */
  public get total_cost(): Monetary {
    return new Monetary(this.data.total_cost);
  }

  /**
   * @returns the total cost of a single unit for a cart product
   */
  public get price(): Monetary {
    return new Monetary(this.data.total_price).divideCopy(this.quantity);
  }

  /**
   * @returns the total cost of a single unit for a cart product
   */
  public get cost(): Monetary {
    return new Monetary(this.data.total_cost).divideCopy(this.quantity);
  }

  /**
   * Increments the quantity by this instance increment value.
   */
  public add(): void {
    this.quantity += this.increment;
  }

  /**
   * Decrements the quantity by this instance increment value
   */
  public remove(): void {
    this.quantity -= this.increment;
  }
}
