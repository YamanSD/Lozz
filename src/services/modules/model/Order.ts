import BaseModel from "./BaseModel";
import CartProduct from "../local_model/CartProduct";
import Courier from "./Courier";
import Customer from "./Customer";
import Monetary from "../local_model/Monetary";
import Restock from "./Restock";
import { basicOrder, Generic, MonetaryType, order, OrderStatus, TrailNature, TrailType } from "./types";
import { InvalidOrderCreationStatusError } from "../controller/Errors";
import CollectionInfo from "../../../CollectionInfo";


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

  /* link order of this exchange order */
  private readonly linkInstance?: Order;

  /**
   * @param data raw order data
   * @param restock representing the order
   * @param customer of the order
   * @param courier of the order
   * @param link associated link order
   */
  public constructor(data: order,
                     restock: Restock,
                     customer: Customer,
                     courier?: Courier,
                     link?: Order) {
    this.dataValue = data;
    this.restockInstance = restock;
    this.customerInstance = customer;
    this.courierInstance = courier;

    if (data.link_id !== link?.id) {
      throw new EvalError(`link ID mismatch, expected ${data.link_id}
      , got ${link?.id}`);
    }

    this.linkInstance = link;
  }

  /**
   * @returns the stored raw data
   */
  public get data(): order {
    return this.dataValue;
  }

  /**
   * @returns the negative quantities of the order
   */
  public get negativeQuantities() {
    return this.restock.negativeQuantities;
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
   * This method is exclusive to pending orders.
   * If the order is not pending, NO ACTION IS TAKEN.
   *
   * @param value new quantities of the order
   */
  public set products(value: basicOrder["products"]) {
    if (this.status === OrderStatus.pending) {
      (this.data as Generic).products = value;
    }
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
   * @returns the address associated with the order
   */
  public get address() {
    return this.data.address;
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
    const products = this.prices;

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
   * @returns the courier instance associated with the order
   */
  public get courier() {
    return this.courierInstance;
  }

  /**
   * @returns true if the order is immutable
   */
  public get immutable(): boolean {
    return this.status === OrderStatus.finalized;
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
   * Note that this does not change the linked instance.
   *
   * @param value new link ID for the order
   */
  public set link_id(value) {
    this.data.link_id = value;
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
    if (this.status === OrderStatus.finalized) {
      throw new TypeError(`Order ${this.id} finalized`);
    }

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
      case OrderStatus.finalized:
        if (this.status !== OrderStatus.canceled
          && this.status !== OrderStatus.canceled_at_courier
          && this.status !== OrderStatus.paid) {
          throw new TypeError(`Order is ${this.status}, but trying to finalize`);
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
    this.prices[usi].price = value.data;

    if (this.getQuantity(usi) === 0) {
      delete this.prices[usi];
    }
  }

  /**
   * @param usi USI of the product
   * @param value price value of the product
   */
  public addToCosts(usi: string, value: Monetary): void {
    this.prices[usi].cost = value.data;

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
   * @param cost value of the product
   */
  public add(usi: string, quantity: number,
             value: Monetary, cost: Monetary): void {
    this.restock.add(usi, quantity, false);
    this.addToTotal(value, quantity);
    this.addToPrices(usi, value);
    this.addToCosts(usi, cost);
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
    this.add(product.usi, product.quantity, product.price, product.cost);
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
      price: MonetaryType,
      cost: MonetaryType}> = {};

    if (this.restock === undefined) {
      // Has products instead of quantities
      return (this.data as Generic).products;
    }

    let quantities = this.quantities;

    for (let usi of Object.keys(quantities)) {
      result[usi] = {
        quantity: quantities[usi],
        price: this.prices[usi].price,
        cost: this.prices[usi].cost
      };
    }

    return result;
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
   * @returns the name of the province of the order
   */
  public get provinceName() {
    return CollectionInfo.provinces[
      this.province ?? (CollectionInfo.provinces.length - 1)
      ];
  }

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
    [status: number]: boolean | undefined | null
  } = {
    [OrderStatus.confirmed]: false,
    [OrderStatus.packaged]: null,
    [OrderStatus.sent_to_courier]: null,
    [OrderStatus.paid]: null,
  };

  /**
   * @param status to be checked if it affects the inventory
   * @returns the type of inventory change needed for the given status
   */
  public static isStatusToInventory(status: OrderStatus):
    boolean | undefined | null {
    if (status in Order.creationStatusToInventory) {
      return Order.creationStatusToInventory[status];
    }

    throw new InvalidOrderCreationStatusError();
  }
}
