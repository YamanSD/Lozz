import BaseModel from "./BaseModel";
import CartProduct from "./CartProduct";
import Category from "./Category";
import Monetary from "./Monetary";
import Vendor from "./Vendor";
import {
  cartProduct, category, product, QuantityType,
  TrailNature, TrailType, vendor
} from "./types";


/**
 * Class encapsulating the product data.
 */
export default class Product implements BaseModel {
  /* raw data of the product */
  private dataValue: product;

  /* represents the vendor of the product */
  private vendorInstance: Vendor;

  /* represents the category of the product */
  private readonly categoryInstance: Category;

  /* used to represent the lack of option values */
  private static readonly NO_OPTIONS_MARK = '_';

  /* separator used in USPs & USIs */
  private static readonly SEPARATOR = '_';

  /*
   * Used to tag wholesale products in a restocking.
   * Used iff the restocking is linked with an order.
   */
  public static readonly WHOLESALE_TAG = "_WHOLE";

  /**
   * @param data raw data of the product
   * @param vendorData raw data for the vendor of the product
   * @param categoryData raw data for the category of the product
   */
  public constructor(data: product,
                     vendorData: vendor,
                     categoryData: category) {
    this.dataValue = data;
    this.vendorInstance = new Vendor(vendorData);
    this.categoryInstance = new Category(categoryData);
  }

  /**
   * @returns the stored raw data
   */
  public get data(): product {
    return this.dataValue;
  }

  /**
   * @param value new value of the raw data
   */
  public set data(value: product) {
    this.dataValue = value;
  }

  /**
   * @returns the ID of the product
   */
  public get id() {
    return this.data.id;
  }

  /**
   * @returns the name of the product
   */
  public get name() {
    return this.data.name;
  }

  /**
   * @returns the vendor ID of the product
   */
  public get vendor_id() {
    return this.data.vendor_id;
  }

  /**
   * @returns the Vendor instance of the product
   */
  public get vendor() {
    return this.vendorInstance;
  }

  /**
   * @returns the category ID of the product
   */
  public get category_id() {
    return this.data.category_id;
  }

  /**
   * @returns the Category instance of the product
   */
  public get category() {
    return this.categoryInstance;
  }

  /**
   * @returns the image url list of the product
   */
  public get images() {
    return this.data.images;
  }

  /**
   * @returns the quantities object for the product
   */
  public get quantities() {
    return this.data.quantities;
  }

  /**
   * @returns the base wholesale price for the product
   */
  public get wholesale_price() {
    if (this.data.wholesale_price === undefined) {
      return undefined;
    }

    return new Monetary(this.data.wholesale_price);
  }

  /**
   * @returns the wholesale increment for the product
   */
  public get wholesale_increment() {
    return this.data.wholesale_increment ?? 1;
  }

  /**
   * @returns the added wholesale price object for the product
   */
  public get added_wholesale_price() {
    return this.data.added_wholesale_price;
  }

  /**
   * @returns the minimum wholesale quantity for the product
   */
  public get minimum_wholesale_quantity() {
    return this.data.minimum_wholesale_quantity;
  }

  /**
   * @returns the base price of the product
   */
  public get price() {
    return new Monetary(this.data.price);
  }

  /**
   * @returns the added price object of the product
   */
  public get added_price() {
    return this.data.added_price;
  }

  /**
   * @returns the inventory quantities object of the product
   */
  public get inventory_quantities() {
    return this.data.inventory_quantities;
  }

  /**
   * @returns the instructions for the product
   */
  public get instructions() {
    return this.data.instructions;
  }

  /**
   * @returns the base cost of the product
   */
  public get cost() {
    return new Monetary(this.data.cost);
  }

  /**
   * @returns the added costs object of the product
   */
  public get added_costs() {
    return this.data.added_costs;
  }

  /**
   * @returns the discount object of the product
   */
  public get discount() {
    return this.data.discount;
  }

  /**
   * @returns the wholesale discount object of the product
   */
  public get wholesale_discount() {
    return this.data.wholesale_discount;
  }

  /**
   * @returns the description of the product
   */
  public get description() {
    return this.data.description;
  }

  /**
   * @param usp USP to get the added price for
   * @returns the added price for the given USP
   */
  public getAddedPrice(usp: string): Monetary {
    if (this.added_price === undefined || !(usp in this.added_price)) {
      return Monetary.noValue();
    }

    return new Monetary(this.added_price[usp]);
  }

  /**
   * @param usp USP to get the added cost for
   * @returns the added cost for the given USP
   */
  public getAddedCost(usp: string): Monetary {
    if (this.added_costs === undefined || !(usp in this.added_costs)) {
      return Monetary.noValue();
    }

    return new Monetary(this.added_costs[usp]);
  }

  /**
   * @param usp USP to get the display quantity for
   * @returns the quantity for the given USP
   */
  public getQuantity(usp?: string): number {
    return this.quantities[usp ?? Product.NO_OPTIONS_MARK] ?? 0;
  }

  /**
   * @param usp USP to get the inventory quantity for
   * @returns the inventory quantity for the given USP
   */
  public getInventoryQuantity(usp?: string): number {
    return this.inventory_quantities[usp ?? Product.NO_OPTIONS_MARK] ?? 0;
  }

  /**
   * @param usp USP to get the discount for
   * @returns the discount for the given USP
   */
  public getDiscount(usp?: string): Monetary {
    if (this.discount === undefined
      || usp === undefined
      || !(usp in this.discount)) {
      return Monetary.noValue();
    }

    return new Monetary(this.discount[usp]);
  }

  /**
   * @param usp USP to get the wholesale discount for
   * @returns the added wholesale discount for the given USP
   */
  public getWholesaleDiscount(usp?: string): Monetary {
    if (this.wholesale_discount === undefined
      || usp === undefined
      || !(usp in this.wholesale_discount)) {
      return Monetary.noValue();
    }

    return new Monetary(this.wholesale_discount[usp]);
  }

  /**
   * @param quantities quantities to test against
   * @returns true if the quantities are valid for wholesale
   */
  public isValidWholesale(quantities: QuantityType): boolean {
    // Avoid long name repetition
    let temp = this.minimum_wholesale_quantity;

    if (temp === undefined) {
      return false;
    }

    /* check that the quantities are available */
    for (let usp of Object.keys(temp)) {
      if (!(usp in quantities) || quantities[usp] < temp[usp]) {
        return false;
      } else if ((quantities[usp] - temp[usp])
        % this.wholesale_increment !== 0) {
        return false; // Check if it matches with increment
      }

      temp[usp] -= quantities[usp];
      quantities[usp] = 0;
    }

    /* check for any remains, if exist return false */
    for (let quantity of Object.values(quantities)) {
      if (quantity !== 0) {
        return false;
      }
    }

    return true;
  }

  /**
   * @param usp USP to get the wholesale price for
   * @returns the added wholesale price for the given USP
   */
  public getAddedWholesalePrice(usp?: string): Monetary {
    if (this.added_wholesale_price === undefined
      || usp === undefined
      || !(usp in this.added_wholesale_price)) {
      return Monetary.noValue();
    }

    return new Monetary(this.added_wholesale_price[usp]);
  }

  /**
   * @param usp USP to get the total price for
   * @returns the total price for the given USP
   */
  public getTotalPrice(usp?: string): Monetary {
    if (usp === undefined) {
      return this.price;
    }

    return this.price.addCopy(this.getAddedPrice(usp))
      .addCopy(this.category.addedPrice(usp))
      .subtractCopy(this.getDiscount(usp)
    );
  }

  /**
   * @param usp USP to get the total wholesale price for
   * @returns the total wholesale price for the given USP
   */
  public getTotalWholesalePrice(usp?: string): typeof this.wholesale_price {
    if (usp === undefined || this.wholesale_price === undefined) {
      return this.wholesale_price;
    }

    return this.wholesale_price.addCopy(this.getAddedWholesalePrice(usp))
      .subtractCopy(this.getWholesaleDiscount());
  }

  /**
   * @param usp USP to get the total cost for
   * @returns the total cost for the given USP
   */
  public getTotalCost(usp?: string): Monetary {
    if (usp === undefined) {
      return Monetary.noValue();
    }

    return this.cost.addCopy(this.getAddedCost(usp));
  }

  /**
   * @param quantities if the given quantities are invalid in any form,
   *        EvalError is thrown.
   * @param to_inventory if true the quantities target the inventory quantities.
   * @throws EvalError if the quantities are invalid
   */
  public checkIsValidAdd(quantities: QuantityType,
                         to_inventory: boolean): void {
    let currentQuantities = to_inventory
      ? this.inventory_quantities
      : this.quantities;

    for (let usp of Object.keys(quantities)) {
      const current = currentQuantities[usp];
      const added = quantities[usp];

      if (!(usp in currentQuantities)) {
        throw new EvalError(`Invalid addition USI: ${this.uspToUsi(usp)}`);
      } else if (added < 0 && current < -added) {
        throw new EvalError(
          `Invalid removal of quantities for USI: ${this.uspToUsi(usp)}
          , given: ${added} 
          , available: ${current}`
        );
      }
    }
  }

  /**
   * @param quantities to be added into the display quantities of the product.
   *        Can be negative, but cannot result in negative quantities.
   *        If the given quantities are invalid in any form,
   *        EvalError is thrown.
   * @param to_inventory if true the quantities target the inventory quantities.
   * @throws EvalError if the quantities are invalid
   */
  public add(quantities: QuantityType, to_inventory: boolean): void {
    this.checkIsValidAdd(quantities, to_inventory);
    let currentQuantities = to_inventory
      ? this.inventory_quantities
      : this.quantities;

    for (let usp of Object.keys(quantities)) {
      currentQuantities[usp] += quantities[usp];
    }
  }

  /**
   * @param option_values to create the USP string
   * @returns the generated USP
   */
  public static createUsp(option_values: [...string[]]): string {
    return option_values.join(Product.SEPARATOR);
  }

  /**
   * @param id ID of the product
   * @param option_values option values chosen to create the USI
   * @returns the generated USI
   */
  public static createUsi(id: string,
                          option_values?: [...any[]]): string {
    let temp = [id];
    temp.push(...option_values ?? []);

    return temp.join(Product.SEPARATOR);
  }

  /**
   * @param option_values to generate the USI for
   * @returns the generated USI for this product according to the option values
   */
  public getUsi(option_values: [...any[]]): string {
    return Product.createUsi(this.id, option_values);
  }

  /**
   * @param usp to be transformed into a USI
   * @returns USI generated using this product and the given USP
   */
  public uspToUsi(usp: string): string {
    let temp = [this.id];
    temp.push(usp);

    return temp.join(Product.SEPARATOR);
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
   * @param value new name of the product
   */
  public set name(value) {
    this.data.name = value;
  }

  /**
   * @param value new vendor of the product
   */
  public set vendor(value) {
    this.vendorInstance = value;
    this.vendor_id = value.id;
  }

  /**
   * @param value new images object
   */
  public set images(value) {
    this.data.images = value;
  }

  /**
   * @param value new quantities object
   */
  public set quantities(value) {
    this.data.quantities = value;
  }

  /**
   * @param value new wholesale price
   */
  public set wholesale_price(value) {
    this.data.wholesale_price = value?.data;
  }

  /**
   * @param value new price of the product
   */
  public set price(value) {
    this.data.price = value.data;
  }

  /**
   * @param value new added wholesale price object
   */
  public set added_wholesale_price(value) {
    this.data.added_wholesale_price = value;
  }

  /**
   * @param value new added price object
   */
  public set added_price(value) {
    this.data.added_price = value;
  }

  /**
   * @param value new inventory quantities object
   */
  public set inventory_quantities(value) {
    this.data.inventory_quantities = value;
  }

  /**
   * @param value new instructions
   */
  public set instructions(value) {
    this.data.instructions = value;
  }

  /**
   * @param value new base cost of the product
   */
  public set cost(value: Monetary) {
    this.data.cost = value.data;
  }

  /**
   * @param value new added costs object of the product
   */
  public set added_costs(value) {
    this.data.added_costs = value;
  }

  /**
   * @param value new discount object of the product
   */
  public set discount(value) {
    this.data.discount = value;
  }

  /**
   * @param value new wholesale discount object of the product
   */
  public set wholesale_discount(value) {
    this.data.wholesale_discount = value;
  }

  /**
   * @param value new description of the product
   */
  public set description(value) {
    this.data.description = value;
  }

  /**
   * @param value new minimum wholesale quantity
   */
  public set minimum_wholesale_quantity(value) {
    this.data.minimum_wholesale_quantity = value;
  }

  /**
   * @param usp USP of the product
   * @param url URL of the image
   */
  public addImage(usp: string, url: string): void {
    if (this.images === undefined) {
      this.images = {};
    }

    if (this.images[usp] === undefined) {
      this.images[usp] = [];
    }

    this.images[usp].push(url);
  }

  /**
   * @param usp USP of the product
   * @param value new added wholesale value for the USP
   */
  public addAddedWholesalePrice(usp: string, value: Monetary): void {
    if (this.added_wholesale_price === undefined) {
      this.added_wholesale_price = {};
    }

    this.added_wholesale_price[usp] = value.data;
  }

  /**
   * @param usp USP of the product
   * @param value new added price for the USP
   */
  public addAddedPrice(usp: string, value: Monetary): void {
    if (this.added_price === undefined) {
      this.added_price = {};
    }

    this.added_price[usp] = value.data;
  }

  /**
   * @param usp USP of the product
   * @param value new added costs for the USP
   */
  public addAddedCosts(usp: string, value: Monetary): void {
    if (this.added_costs === undefined) {
      this.added_costs = {};
    }

    this.added_costs[usp] = value.data;
  }

  /**
   * @param usp USP of the product
   * @param value new added discount value for the USP
   */
  public addDiscount(usp: string, value: Monetary): void {
    if (this.discount === undefined) {
      this.discount = {};
    }

    this.discount[usp] = value.data;
  }

  /**
   * @param usp USP of the product
   * @param value new added wholesale discount for the USP
   */
  public addAddedWholesaleDiscount(usp: string, value: Monetary): void {
    if (this.wholesale_discount === undefined) {
      this.wholesale_discount = {};
    }

    this.wholesale_discount[usp] = value.data;
  }

  /**
   * @param url URL to be removed from all USPs
   */
  public removeImage(url: string): void {
    if (this.images === undefined) {
      return;
    }

    for (let usp of Object.keys(this.images)) {
      const index = this.images[usp].indexOf(url);

      if (-1 < index) {
        this.images[usp].splice(index, 1);
      }
    }
  }

  /**
   * @param usp to be removed from the added wholesale prices
   */
  public removeAddedWholesalePrice(usp: string): void {
    if (this.added_wholesale_price === undefined
      || !(usp in this.added_wholesale_price)) {
      return;
    }

    delete this.added_wholesale_price[usp];
  }

  /**
   * @param usp to be removed from the added prices
   */
  public removeAddedPrice(usp: string): void {
    if (this.added_price === undefined
      || !(usp in this.added_price)) {
      return;
    }

    delete this.added_price[usp];
  }

  /**
   * @param usp to be removed from the added cost prices
   */
  public removeAddedCost(usp: string): void {
    if (this.added_costs === undefined
      || !(usp in this.added_costs)) {
      return;
    }

    delete this.added_costs[usp];
  }

  /**
   * @param usp to be removed from the discounts
   */
  public removeDiscount(usp: string): void {
    if (this.discount === undefined
      || !(usp in this.discount)) {
      return;
    }

    delete this.discount[usp];
  }

  /**
   * @param usp to be removed from the wholesale discounts
   */
  public removeAddedWholesaleDiscount(usp: string): void {
    if (this.added_wholesale_price === undefined
      || !(usp in this.added_wholesale_price)) {
      return;
    }

    delete this.added_wholesale_price[usp];
  }

  /**
   * Factory method for CartProducts.
   *
   * @param option_values selected option values
   * @param quantity selected quantity
   * @param is_wholesale indicate if the product is wholesale
   * @returns CartProduct instance with proper data
   */
  public detachSelection(
    option_values: [...string[]],
    quantity: number,
    is_wholesale: boolean
  ) {
    const usp = Product.createUsp(option_values);
    let data: cartProduct = {
      usi: this.uspToUsi(usp),
      name: this.name,
      quantity: quantity,
      total_price: this.getTotalPrice(usp).multiplyCopy(quantity).data,
      discount: this.getDiscount(usp),
      description: this.description,
      increment: this.wholesale_increment,
      is_wholesale: is_wholesale
    };

    if (this.images !== undefined
      && this.images[usp] !== undefined
      && 0 < this.images[usp].length) {
      data.image = this.images[usp][0];
    }

    return new CartProduct(data, this.category, this.vendor);
  }

  /**
   * @param value new value of the vendor ID
   * @private
   */
  private set vendor_id(value) {
    this.data.vendor_id = value;
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
}
