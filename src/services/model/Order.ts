import BaseModel from "./BaseModel";
import CartProduct from "../local_model/CartProduct";
import Courier from "./Courier";
import Customer from "./Customer";
import Monetary from "../local_model/Monetary";
import {
  basicOrder,
  Generic,
  ItemQuantityType,
  MonetaryType,
  order,
  OrderProductQuantities,
  orderProducts,
  OrderStatus,
  TrailNature,
  TrailType
} from "./types";
import { InvalidOrderCreationStatusError } from "../controller/Errors";
import CollectionInfo from "../../CollectionInfo";


/**
 * Class encapsulating the order data.
 */
export default class Order implements BaseModel {
  /**
   * - undefined indicates both quantities change
   * - false indicates only display quantities change
   * - true indicates only inventory quantities change
   *
   * This function is used on creation only.
   *
   * @private
   */
  private static creationStatusToInventory: {
    [status: number]: boolean | null
  } = {
    [OrderStatus.confirmed]: false,
    [OrderStatus.packaged]: null,
    [OrderStatus.sent_to_courier]: null,
    [OrderStatus.paid]: null
  };
  /* raw order data */
  private dataValue: order;
  /* courier instance that will deliver the order */
  private courierInstance?: Courier;
  /* customer instance representing the customer of the order */
  private readonly customerInstance: Customer;
  /* link order of this exchange order */
  private readonly linkInstance?: Order;

  /**
   * @param data raw order data
   * @param customer of the order
   * @param courier of the order
   * @param link associated link order
   */
  public constructor(data: order,
                     customer: Customer,
                     courier?: Courier,
                     link?: Order) {
    this.dataValue = data;
    this.customerInstance = customer;
    this.courierInstance = courier;

    if (data.link_id !== link?.id) {
      throw new EvalError(`link ID mismatch, expected ${data.link_id}
      , got ${link?.id}`);
    }

    this.linkInstance = link;
  }

  /**
   * Quantities not in the inventory are added to the inventory.
   * Quantities not on display are added to the on display.
   *
   * @returns the duplicated products according to the above criteria
   */
  public get duplicateProducts(): orderProducts {
    return Order.duplicateProducts(this.products);
  }

  /**
   * @returns the stored raw data
   */
  public get data(): order {
    return this.dataValue;
  }

  /**
   * @param value new value of the raw data
   */
  public set data(value: order) {
    this.dataValue = value;
  }

  /**
   * @returns the ID of the order
   */
  public get id() {
    return this.data.id;
  }

  /**
   * @returns the attached note to the order
   */
  public get note() {
    return this.data.note;
  }

  /**
   * @param value new note associated with the order
   */
  public set note(value) {
    this.data.note = value;
  }

  /**
   * @returns the RUSI set in the order
   */
  public get usiSet() {
    return Object.keys(this.products);
  }

  /**
   * @returns the quantities object for the order
   */
  public get quantities() {
    return Order.getQuantities(this.products);
  }

  /**
   * @returns the discount of the order
   */
  public get discount() {
    return this.data.discount !== undefined
      ? new Monetary(this.data.discount)
      : undefined;
  }

  /**
   * @param value new value of the discount, must be positive
   */
  public set discount(value) {
    if (value !== undefined && !value.isNegative) {
      this.data.discount = value.data;
    }
  }

  /**
   * @returns the status of the order
   */
  public get status() {
    return this.data.status;
  }

  /**
   * @param value new status of the order
   * @throws TypeError if the status is not attainable
   */
  public set status(value) {
    /* Check compatibility */
    switch (value) {
      case OrderStatus.pending:
        throw new TypeError(`Order cannot be set to pending in any case`);
      case OrderStatus.confirmed:
        if (this.status !== OrderStatus.pending) {
          throw new TypeError(`Order is ${this.status}, but trying to confirm`);
        }
        break;
      case OrderStatus.packaged:
        if (this.status !== OrderStatus.confirmed
          && this.status !== OrderStatus.pending) {
          throw new TypeError(`Order is ${this.status}, but trying to package`);
        }
        break;
      case OrderStatus.sent_to_courier:
        if (this.status !== OrderStatus.packaged) {
          throw new TypeError(`Order is ${this.status}
          , but trying to send to courier`);
        }
        break;
      case OrderStatus.paid:
        if (this.status !== OrderStatus.sent_to_courier
          && this.status !== OrderStatus.packaged
          && this.status !== OrderStatus.confirmed
          && this.status === OrderStatus.paid) {
          throw new TypeError(`Order is ${this.status}, but trying to pay`);
        }
        break;
      case OrderStatus.canceled:
        if (this.status === OrderStatus.canceled ||
          this.status === OrderStatus.canceled_at_courier ||
          this.status === OrderStatus.received_from_courier) {
          throw new TypeError(`Order is ${this.status}, but trying cancel`);
        }
        break;
      case OrderStatus.canceled_at_courier:
        if (this.status !== OrderStatus.sent_to_courier) {
          throw new TypeError(`Order is ${this.status}
          , but trying to cancel at courier`);
        }
        break;
      case OrderStatus.received_from_courier:
        if (this.status !== OrderStatus.canceled_at_courier) {
          throw new TypeError(`Order is ${this.status}
          , but trying to receive from courier`);
        }
        break;
      default:
        throw new Error("Unreachable order status");
    }

    this.data.status = value;
  }

  /**
   * @returns the total of the order
   */
  public get total() {
    return this.data.total !== undefined
      ? new Monetary(this.data.total)
      : undefined;
  }

  /**
   * @param value new total of the order
   */
  public set total(value) {
    if (value === undefined) {
      return;
    }

    this.data.total = value.data;
  }

  /**
   * @returns the province index associated with the order
   */
  public get province() {
    return this.data.province;
  }

  /**
   * @param value new province associated with the order
   */
  public set province(value) {
    this.data.province = value;
  }

  /**
   * @returns the address associated with the order
   */
  public get address() {
    return this.data.address;
  }

  /**
   * @param value new address associated with the order
   */
  public set address(value) {
    this.data.address = value;
  }

  /**
   * @returns the total to pay by the customer for the order
   */
  public get total_to_pay(): Monetary {
    return (this.total ?? Monetary.noValue())
      .subtractCopy(this.discount ?? Monetary.noValue())
      .addCopy(this.delivery ?? Monetary.noValue());
  }

  /**
   * @returns the profit of the order considering the
   *          costs, prices, discount, & delivery.
   */
  public get profit(): Monetary {
    let result: Monetary = Monetary.noValue();
    let delivery: Monetary = this.delivery ?? Monetary.noValue();
    let discount: Monetary = this.discount ?? Monetary.noValue();

    if (delivery.isNegative) {
      result.subtract(delivery);
    }

    result.subtract(discount);
    const products = this.products;

    for (let usi of Object.keys(products)) {
      const cost = new Monetary(products[usi].cost);
      const price = new Monetary(products[usi].price);
      const quantity = this.getQuantity(usi);

      // Negative, since quantities are negative when removing
      price.multiply(-quantity);
      cost.multiply(-quantity);

      result.add(price);
      result.subtract(cost);
    }

    return result;
  }

  /**
   * @returns the delivery associated with the order
   */
  public get delivery() {
    return this.data.delivery !== undefined
      ? new Monetary(this.data.delivery)
      : undefined;
  }

  /**
   * @param value new delivery fee associated with the order
   */
  public set delivery(value) {
    if (value !== undefined) {
      this.data.delivery = value.data;
    }
  }

  /**
   * @returns the courier instance associated with the order
   */
  public get courier() {
    return this.courierInstance;
  }

  /**
   * @param value new courier associated with the order
   */
  public set courier(value) {
    if (value !== undefined) {
      this.courierInstance = value;
      this.data.courier_id = value.name;
    }
  }

  /**
   * @returns the customer instance associated with the order
   */
  public get customer() {
    return this.customerInstance;
  }

  /**
   * @returns the payment associated with the order
   */
  public get payment() {
    return this.data.payment !== undefined
      ? new Monetary(this.data.payment)
      : undefined;
  }

  /**
   * @param value new payment associated with the order
   */
  public set payment(value) {
    if (value !== undefined) {
      this.data.payment = value.data;
    }
  }

  /**
   * @returns the commission associated with the order for the employee
   */
  public get commission_percent() {
    return this.data.commission_percent;
  }

  /**
   * @returns the phone number associated with the order
   */
  public get phone_number() {
    return this.data.phone_number;
  }

  /**
   * @param value new phone number associated with the order
   */
  public set phone_number(value) {
    if (value !== undefined) {
      this.data.phone_number = value;
    }
  }

  /**
   * @returns the products mapping in the order
   */
  public get products() {
    return this.data.products;
  }

  /**
   * This method is exclusive to pending orders.
   * If the order is not pending, NO ACTION IS TAKEN.
   *
   * @param value new quantities of the order
   */
  public set products(value: orderProducts) {
    if (this.status === OrderStatus.pending) {
      (this.data as Generic).products = value;
    }
  }

  /**
   * @returns the email associated with the order
   */
  public get email() {
    return this.data.email;
  }

  /**
   * @param value new email associated with the order
   */
  public set email(value) {
    if (value !== undefined) {
      this.data.email = value;
    }
  }

  /**
   * @returns the associated link order of this instance
   */
  public get linkOrder() {
    return this.linkInstance;
  }

  /**
   * @returns the ID of the link exchange order
   */
  public get link_id() {
    return this.data.link_id;
  }

  /**
   * Note that this does not change the linked instance.
   *
   * @param value new link ID for the order
   */
  public set link_id(value) {
    this.data.link_id = value;
  }

  /**
   * @param value new value of discount percent.
   *        Must be in [0, 1]
   * @throws EvalError if the value is invalid
   */
  public set discount_percent(value: number) {
    this.discount = this.total?.applyDiscountPercentCopy(value);
  }

  /**
   * @returns the total item count in the order
   */
  public get item_count() {
    return this.data.item_count;
  }

  /**
   * @param value new item_count value
   */
  public set item_count(value) {
    this.data.item_count = value;
  }

  /**
   * @returns the ID of the employee that created the order
   */
  public get employee_id() {
    return BaseModel.initialEmployee(this.trail);
  }

  /**
   * @returns true if the order operation can be indirectly deleted
   */
  public get deletable(): boolean {
    return this.status !== undefined;
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
   * @returns whether the object is deactivated
   */
  public get isDeactivated(): boolean {
    for (let timestamp of Object.keys(this.trail)) {
      if (this.trail[timestamp].nature === TrailNature.D) {
        return true;
      }
    }

    return false;
  }

  /**
   * @returns whether the object is deleted
   */
  public get isDeleted(): boolean {
    return BaseModel.isDeleted(this.trail);
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
    return new Order(
      this.dataCopy,
      this.customer,
      this.courier
    );
  }

  /**
   * @returns the zone of the order
   */
  public get zone() {
    return this.data.zone;
  }

  /**
   * @param value new value of the zone
   */
  public set zone(value) {
    this.data.zone = value;
  }

  /**
   * @returns a copy of the quantities, but values are zeros
   */
  public get zeroQuantityProducts() {
    let result: orderProducts = {};

    for (let usi of Object.keys(this.products)) {
      result[usi] = {
        price: this.products[usi].price,
        cost: this.products[usi].cost,
        quantity: 0,
        inv_quantity: 0
      };
    }

    return result;
  }

  /**
   * @returns the name of the province of the order
   */
  public get provinceName() {
    return CollectionInfo.provinces[
    this.province ?? (CollectionInfo.provinces.length - 1)
      ];
  }

  /**
   * @param product item quantity to extract the quantities from
   * @returns the quantity and inventory quantity
   */
  public static extractQuantities(product: ItemQuantityType) {
    return {
      quantity: product.quantity,
      inv_quantity: product.inv_quantity
    };
  }

  /**
   * @param products to convert
   * @param to_inventory if true all products become to inventory.
   *        Otherwise, all products become to display.
   * @returns converted products
   */
  public static convertDestination(products: orderProducts,
                                   to_inventory: boolean): orderProducts {
    let result: orderProducts = {};

    for (let usi of Object.keys(products)) {
      if (!(usi in result)) {
        result[usi] = products[usi];
      }

      if (to_inventory) {
        if (result[usi].inv_quantity === 0 && result[usi].quantity !== 0) {
          result[usi].inv_quantity = result[usi].quantity;
        }

        result[usi].quantity = 0;
      } else {
        if (result[usi].quantity === 0 && result[usi].inv_quantity !== 0) {
          result[usi].quantity = result[usi].inv_quantity;
        }

        result[usi].inv_quantity = 0;
      }
    }

    return result;
  }

  /**
   * Quantities not in the inventory are added to the inventory.
   * Quantities not on display are added to the on display.
   *
   * @param products to be converted
   * @returns the duplicated products according to the above criteria
   */
  public static duplicateProducts(products: orderProducts): orderProducts {
    let result: orderProducts = {};

    for (let usi of Object.keys(products)) {
      if (!(usi in result)) {
        result[usi] = products[usi];
      }

      if (result[usi].inv_quantity === 0) {
        result[usi].inv_quantity = result[usi].quantity;
      } else if (result[usi].quantity === 0) {
        result[usi].quantity = result[usi].inv_quantity;
      }
    }

    return result;
  }

  /**
   * @param products to extract quantities from
   * @returns the quantities in the products object
   */
  public static getQuantities(products: orderProducts) {
    let result: OrderProductQuantities = {};

    for (let usi of Object.keys(products)) {
      result[usi] = {
        quantity: products[usi].quantity,
        inv_quantity: products[usi].inv_quantity
      };
    }

    return result;
  }

  /**
   * @param status to be checked if it affects the inventory
   * @returns the type of inventory change needed for the given status
   */
  public static isStatusToInventory(status: OrderStatus):
    boolean | null {
    if (status in Order.creationStatusToInventory) {
      return Order.creationStatusToInventory[status];
    }

    throw new InvalidOrderCreationStatusError();
  }

  /**
   * @param to_inventory if true all products become to inventory.
   *        Otherwise, all products become to display.
   * @returns converted products
   */
  public convertDestination(to_inventory: boolean): orderProducts {
    return Order.convertDestination(this.products, to_inventory);
  }

  /**
   * @param value monetary value to be added
   * @param quantity multiplier for the value
   */
  public addToTotal(value: Monetary, quantity: number = 1) {
    this.total?.add(value.multiplyCopy(quantity));
  }

  /**
   * @param usi USI of the product
   * @param value price value of the product
   */
  public addToPrices(usi: string, value: Monetary): void {
    this.products[usi].price = value.data;

    if (this.getQuantity(usi) === 0) {
      delete this.products[usi];
    }
  }

  /**
   * @param usi USI of the product
   * @param value price value of the product
   */
  public addToCosts(usi: string, value: Monetary): void {
    this.products[usi].cost = value.data;

    if (this.getQuantity(usi) === 0) {
      delete this.products[usi];
    }
  }

  /**
   * Adds the given quantity to the quantity of the USI in the order.
   *
   * @param usi to add quantity for
   * @param quantity value to be added
   * @param value price of the product
   * @param cost value of the product
   * @param to_inventory if true the quantities are added to the inventory.
   *        Otherwise, if false, to display only.
   *        Otherwise, if null to both
   */
  public add(usi: string, quantity: number,
             value: Monetary, cost: Monetary,
             to_inventory: boolean | null): void {
    if (!(usi in this.products)) {
      this.products[usi] = {
        inv_quantity: 0,
        quantity: 0,
        price: value.data,
        cost: cost.data
      };
    }

    this.item_count += Math.abs(quantity);

    if (to_inventory !== false) {
      this.products[usi].inv_quantity += quantity;
    }

    if (to_inventory !== true) {
      this.products[usi].quantity += quantity;
    }

    this.addToTotal(value, quantity);
    this.addToPrices(usi, value);
    this.addToCosts(usi, cost);
  }

  /**
   * @param usi to check quantity for
   */
  public getQuantity(usi: string): number {
    const quantity = this.products[usi]?.quantity ?? 0;
    const invQuantity = this.products[usi]?.inv_quantity ?? 0;

    return quantity === 0 ? invQuantity : quantity;
  }

  /**
   * @param product CartProduct to be added to the order
   *
   * Adds the given cart product to the order
   */
  public addCartProduct(product: CartProduct): void {
    this.add(product.usi, product.quantity, product.price, product.cost, false);
  }

  /**
   * @param nature type of action done by the employee
   */
  public stamp(nature: TrailNature): void {
    BaseModel.stamp(this.trail, nature);
  }

  /**
   * @param usi to get the price for
   * @returns the price for the given USI
   */
  public getPrice(usi: string): MonetaryType {
    return this.products[usi].price;
  }

  /**
   * @param usi to get the cost for
   * @returns the cost for the given USI
   */
  public getCost(usi: string): MonetaryType {
    return this.products[usi].price;
  }

  /**
   * @param status status of the basic data
   * @returns a basic version of the data used to transition
   *          orders from pending state
   */
  public getBasicData(status: OrderStatus): basicOrder {
    return {
      note: this.note,
      status: status,
      discount: this.discount?.data,
      province: this.province,
      zone: this.zone,
      address: this.address,
      delivery: this.delivery?.data,
      courier_id: this.courier?.name,
      customer_id: this.customer.phone_number,
      products: this.generateBasicQuantities(),
      phone_number: this.phone_number,
      email: this.email,
      link_id: this.linkOrder?.id
    };
  }

  /**
   * @returns basic quantities suitable for getBasicData
   * @private
   */
  private generateBasicQuantities() {
    let result: orderProducts = {};

    let quantities = this.quantities;

    for (let usi of Object.keys(quantities)) {
      result[usi] = {
        quantity: quantities[usi].quantity,
        inv_quantity: quantities[usi].inv_quantity,
        price: this.getPrice(usi),
        cost: this.getCost(usi)
      };
    }

    return result;
  }
}
