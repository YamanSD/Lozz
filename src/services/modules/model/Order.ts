import BaseModel from "./BaseModel";
import CartProduct from "../local_model/CartProduct";
import Courier from "./Courier";
import Customer from "./Customer";
import Monetary from "./Monetary";
import Restock from "./Restock";
import { basicOrder, Generic, MonetaryType, order, OrderStatus, TrailNature, TrailType } from "./types";
import { InvalidOrderCreationStatusError } from "../controller/Errors";


/**
 * Class encapsulating the order data.
 */
export default class Order implements BaseModel {
  /* raw order data */
  private dataValue: order;

  /* restock instance containing the values */
  private readonly restockInstance: Restock;

  /* courier instance that will deliver the order */
  private courierInstance?: Courier;

  /* customer instance representing the customer of the order */
  private readonly customerInstance: Customer;

  /* parent order of this exchange order */
  private readonly parentInstance?: Order;

  /**
   * @param data raw order data
   * @param restock representing the order
   * @param customer of the order
   * @param courier of the order
   * @param parent associated Parent order
   */
  public constructor(data: order,
                     restock: Restock,
                     customer: Customer,
                     courier?: Courier,
                     parent?: Order) {
    this.dataValue = data;
    this.restockInstance = restock;
    this.customerInstance = customer;
    this.courierInstance = courier;

    if (data.parent_id !== parent?.id) {
      throw new EvalError(`Parent ID mismatch, expected ${data.parent_id}
      , got ${parent?.id}`);
    }

    this.parentInstance = parent;
  }

  public static quantitiesInstance(data: order): Order {
    return new Order(data, {} as Restock, {} as Customer);
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
   * @returns the quantities object for the order
   */
  public get quantities() {
    return this.restock.quantities;
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
   * @returns the status of the order
   */
  public get status() {
    return this.data.status;
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
   * @returns the province associated with the order
   */
  public get province() {
    return this.data.province;
  }

  /**
   * @returns the address associated with the order
   */
  public get address() {
    return this.data.address;
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
   * @returns the courier instance associated with the order
   */
  public get courier() {
    return this.courierInstance;
  }

  /**
   * @returns the customer instance associated with the order
   */
  public get customer() {
    return this.customerInstance;
  }

  /**
   * @returns the restock instance associated with the order
   */
  public get restock() {
    return this.restockInstance;
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
   * @returns the prices of the products in the order
   */
  public get prices() {
    return this.data.prices;
  }

  /**
   * @returns the email associated with the order
   */
  public get email() {
    return this.data.email;
  }

  /**
   * @returns the associated parent order of this instance
   */
  public get parent() {
    return this.parentInstance;
  }

  /**
   * @returns the ID of the parent exchange order
   */
  public get exchange_id() {
    return this.data.parent_id;
  }

  /**
   * @param value new note associated with the order
   */
  public set note(value) {
    this.data.note = value;
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
   * @param value new value of the discount, must be positive
   */
  public set discount(value) {
    if (value !== undefined && !value.isNegative) {
      this.data.discount = value.data;
    }
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
        if (this.status !== OrderStatus.sent_to_courier) {
          throw new TypeError(`Order is ${this.status}, but trying to pay`);
        }
        break;
      case OrderStatus.canceled:
        if (this.status !== OrderStatus.confirmed
          && this.status !== OrderStatus.pending) {
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
   * @param value new province associated with the order
   */
  public set province(value) {
    this.data.province = value;
  }

  /**
   * @param value new address associated with the order
   */
  public set address(value) {
    this.data.address = value;
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
   * @param value new courier associated with the order
   */
  public set courier(value) {
    if (value !== undefined) {
      this.courierInstance = value;
      this.data.courier_id = value.name;
    }
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
   * @param value new phone number associated with the order
   */
  public set phone_number(value) {
    if (value !== undefined) {
      this.data.phone_number = value;
    }
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
    this.prices[usi] = value.data;

    if (this.getQuantity(usi) === 0) {
      delete this.prices[usi];
    }
  }

  /**
   * Adds the given quantity to the quantity of the USI in the order.
   *
   * @param usi to add quantity for
   * @param quantity value to be added
   * @param value price of the product
   */
  public add(usi: string, quantity: number, value: Monetary): void {
    this.restock.add(usi, quantity);
    this.addToTotal(value, quantity);
    this.addToPrices(usi, value);
  }

  /**
   * @param usi to check quantity for
   */
  public getQuantity(usi: string): number {
    return this.restock.getQuantity(usi);
  }

  /**
   * @param product CartProduct to be added to the order
   *
   * Adds the given cart product to the order
   */
  public addCartProduct(product: CartProduct): void {
    this.add(product.usi, product.quantity, product.total_price);
  }

  /**
   * @returns the total item count in the order
   */
  public get item_count() {
    return this.restock.item_count;
  }

  /**
   * @returns the ID of the employee that created the order
   */
  public get employee_id() {
    return this.restock.employee_id;
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
    return new Order(
      this.dataCopy,
      this.restock,
      this.customer,
      this.courier
    );
  }

  /**
   * @returns basic quantities suitable for getBasicData
   * @private
   */
  private generateBasicQuantities() {
    let result: Generic<{
      quantity: number,
      price: MonetaryType}> = {};
    let quantities = this.quantities;

    for (let usi of Object.keys(quantities)) {
      result[usi] = {
        quantity: quantities[usi],
        price: this.prices[usi]
      };
    }

    return result;
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
      address: this.address,
      delivery: this.delivery?.data,
      courier_id: this.courier?.name,
      customer_id: this.customer.phone_number,
      products: this.generateBasicQuantities(),
      phone_number: this.phone_number,
      email: this.email,
      parent_id: this.parent?.id
    };
  }

  /**
   * - undefined indicates both quantities change
   * - false indicates only display quantities change
   * - true indicates only inventory quantities change
   *
   * @private
   */
  private static creationStatusToInventory: {
    [status: number]: boolean | undefined
  } = {
    [OrderStatus.confirmed]: false,
    [OrderStatus.packaged]: undefined,
    [OrderStatus.sent_to_courier]: undefined,
    [OrderStatus.paid]: undefined,
  };

  public static isStatusToInventory(status: OrderStatus): boolean | undefined {
    if (status in Order.creationStatusToInventory) {
      return Order.creationStatusToInventory[status];
    }

    throw new InvalidOrderCreationStatusError();
  }
}
