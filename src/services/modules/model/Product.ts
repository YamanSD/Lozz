import BaseModel from "./BaseModel";
import CartProduct from "../local_model/CartProduct";
import Category from "./Category";
import Monetary from "./Monetary";
import Vendor from "./Vendor";
import {
  cartProduct, category, product, QuantityType,
  TrailNature, TrailType, vendor
} from "./types";
import { IllegalStateError } from "../controller/Errors";


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

  /* name that can be used for properties */
  public static readonly exclusiveName =
    `${Product.SEPARATOR}${Product.SEPARATOR}$DATA_PROPERTIES`;

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
   * @param id ID of the product, not present in data
   * @param data raw data of the product
   * @returns a wrapper instance used by the restocks manager
   */
  public static generateWrapper(id: string, data: product): Product {
    data.id = id;
    return new Product(data, {} as vendor, {} as category);
  }

  /**
   * @param to_inventory if the quantities are for the inventory
   * @returns an object containing only the suitable quantities
   */
  public suitableQuantities(to_inventory: boolean) {
    return to_inventory ? {
      inventory_quantities: this.inventory_quantities,
      quantities: this.quantities
    } : {
      quantities: this.quantities
    };
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
   * @returns the increment for the product
   */
  public get increment() {
    return this.data.increment ?? 1;
  }

  /**
   * @returns the minimum sale quantities for each USI of the product
   */
  public get minimum_quantity() {
    return this.data.minimum_quantity;
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
   * @returns the total quantity of the product
   */
  public get totalQuantity(): number {
    let result: number = 0;

    for (let usp of Object.keys(this.quantities)) {
      result += this.getQuantity(usp);
    }

    return result;
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
   * @param usp to get minimum quantity for
   * @returns the minimum quantity for the given USP
   */
  public getMinimumQuantity(usp: string): number {
    if (this.minimum_quantity === undefined
      || !(usp in this.minimum_quantity)) {
      return 0;
    }

    return this.minimum_quantity[usp];
  }

  /**
   * @param usp to add minimum quantity for
   * @param value new value of the USP
   */
  public addMinimumQuantity(usp: string, value: number) {
    if (this.minimum_quantity === undefined) {
      this.minimum_quantity = {};
    }

    this.minimum_quantity[usp] = value;
  }

  /**
   * @param usp to be removed from the minimum quantities
   */
  public removeMinimumQuantity(usp: string): void {
    if (this.minimum_quantity === undefined
      || !(usp in this.minimum_quantity)) {
      return;
    }

    delete this.minimum_quantity[usp];
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
   * @param usp to be checked if it can be formed according to the
   *        category model
   * @returns true if the USP is valid, otherwise false
   */
  public isValidUsp(usp: string): boolean {
    if (this.category.option_keys === undefined) {
      return usp === Product.NO_OPTIONS_MARK;
    } else if (this.category.option_sets === undefined) {
      throw new IllegalStateError();
    }

    const selectedOptionValues = Product.invertUsp(usp);
    const optionKeys = this.category.option_keys;

    for (let i in optionKeys) {
      const optionValue = selectedOptionValues[i];

      if (!(optionValue in this.category.option_sets[optionKeys[i]])) {
        return false;
      }
    }

    return true;
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

      if (!this.isValidUsp(usp)) {
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

    for (let usp of Object.keys(quantities)) {
      const quantity = quantities[usp];

      this.quantities[usp] += quantity;

      if (to_inventory) {
        this.inventory_quantities[usp] += quantity;
      }
    }
  }

  /**
   * @param usi to be converted
   * @returns the USP in the USI
   */
  public static usiToUsp(usi: string): string {
    return usi.substring(usi.indexOf(Product.SEPARATOR) + 1);
  }

  /**
   * Alias for adding a single USP to the quantities
   *
   * @param usi to be added
   * @param quantity of the given USP
   * @param to_inventory if true the quantities target the inventory quantities
   */
  public addUspQuantity(usi: string,
                        quantity: number,
                        to_inventory: boolean): void {
    this.add({
      [Product.usiToUsp(usi)]: quantity
    }, to_inventory);
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
   * @param usp of a product
   * @returns option values array of the USP
   */
  public static invertUsp(usp: string) {
    return usp.split(Product.SEPARATOR);
  }

  /**
   * @param usi of a product
   * @returns object containing product ID & option_values array
   */
  public static invertUsi(usi: string) {
    const temp = usi.split(Product.SEPARATOR);

    return {
      id: temp[0],
      option_values: temp.splice(1)
    };
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
    this.vendor_id = value.name;
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
   * @param value new price of the product
   */
  public set price(value) {
    this.data.price = value.data;
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
   * @param title of the instruction
   * @param body actual instructions
   */
  public addInstruction(title: string, body: string): void {
    if (this.instructions === undefined) {
      this.instructions = {};
    }

    this.instructions[title] = body;
  }

  /**
   * @param title of the instruction
   */
  public removeInstruction(title: string): void {
    if (this.instructions === undefined || !(title in this.instructions)) {
      return;
    }

    delete this.instructions[title];
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
   * @param value new description of the product
   */
  public set description(value) {
    this.data.description = value;
  }

  /**
   * @param value new minimum sale quantities
   */
  public set minimum_quantity(value) {
    this.data.minimum_quantity = value;
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
   * Factory method for CartProducts.
   *
   * @param option_values selected option values
   * @param quantity selected quantity
   * @returns CartProduct instance with proper data
   */
  public detachSelection(
    option_values: [...string[]],
    quantity: number,
  ) {
    const usp = Product.createUsp(option_values);
    let data: cartProduct = {
      usi: this.uspToUsi(usp),
      name: this.name,
      quantity: quantity,
      total_price: this.getTotalPrice(usp).multiplyCopy(quantity).data,
      discount: this.getDiscount(usp),
      description: this.description,
      increment: this.increment,
      max_quantity: this.getQuantity(usp),
      min_quantity: this.getMinimumQuantity(usp)
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

  /**
   * @returns a deep copy of the raw data
   */
  public get dataCopy() {
    return BaseModel.copy(this.data);
  }

  /**
   * @returns a copy of the object
   */
  public get copy() {
    return new Product(this.dataCopy, this.vendor, this.category);
  }
}
