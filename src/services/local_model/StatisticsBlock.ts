import {
  dissectedTimestamp,
  OrderStatus,
  statisticsBlock,
  TrailType } from "../model/types";
import { MMKV } from "react-native-mmkv";
import CollectionInfo from "../../CollectionInfo";
import Monetary from "./Monetary";
import BaseModel from "../model/BaseModel";
import Restock from "../model/Restock";
import Order from "../model/Order";
import Expense from "../model/Expense";
import { isEqual } from "lodash";
import Product from "../model/Product";


/**
 * Enum class for time iteration types.
 */
enum TimeUnit {
  year = 0,
  month,
  day,
  hour
}

/**
 * This function is the default mapping function.
 *
 * @param block to be processed
 * @returns the block unchanged
 */
function defaultMapping(block: StatisticsBlock): StatisticsBlock {
  return block;
}

/* type of mapping functions */
type MappingFunction = (block: StatisticsBlock) => any;

/**
 * Class encapsulating raw statistics block data.
 * Responsible for loading & saving statistical data
 */
export default class StatisticsBlock {
  /* raw statistics data */
  private dataValue: statisticsBlock;

  /* persistence instance to store the statistics data */
  private static storage: MMKV = new MMKV({
    id: `${CollectionInfo.app_name}-${CollectionInfo.statistics.name}-mmkv`,
    encryptionKey: CollectionInfo.statistics.name
  });

  /* date accuracy of the timestamps */
  private static accuracy: number = 10;

  /* ID for the is loaded flag */
  private static isLoadedId: string = "isloaded-flag-mmkv";

  /* dissected timestamp object */
  private dissected_timestamp: dissectedTimestamp;

  /**
   * @param data raw statistics data
   */
  public constructor(data: statisticsBlock) {
    this.dataValue = data;
    this.dissected_timestamp =
      StatisticsBlock.dissectTimestamp(data.timestamp);
  }

  /**
   * Resets all statistics
   */
  public static clear(): void {
    this.storage.clearAll();
  }

  /**
   * @returns the MMKV storage instance for the statistics
   * @private
   */
  protected get storage() {
    return StatisticsBlock.storage;
  }

  /**
   * @returns the timestamp in the block
   */
  public get timestamp() {
    return this.data.timestamp;
  }

  /**
   * @returns the sales in the block
   */
  public get sales() {
    return new Monetary(this.data.sales);
  }

  /**
   * @returns the sold_products in the block
   */
  public get sold_products() {
    return this.data.sold_products;
  }

  /**
   * @returns the actual number of sold products
   */
  public get actual_sold() {
    return this.data.actual_sold_products;
  }

  /**
   * @returns the sold_quantities in the block
   */
  public get sold_quantities() {
    return this.data.sold_quantities;
  }

  /**
   * @returns the order_counts in the block
   */
  public get order_counts() {
    return this.data.order_counts;
  }

  /**
   * @returns the profit in the block
   */
  public get profit() {
    return new Monetary(this.data.profit);
  }

  /**
   * @returns the total_expenses in the block
   */
  public get total_expenses() {
    return new Monetary(this.data.total_expenses);
  }

  /**
   * @returns the shipping_fees in the block
   */
  public get shipping_fees() {
    return new Monetary(this.data.shipping_fees);
  }

  /**
   * @returns the employee_payments in the block
   */
  public get employee_payments() {
    return new Monetary(this.data.employee_payments);
  }

  /**
   * @returns the vendor_payments in the block
   */
  public get vendor_payments() {
    return new Monetary(this.data.vendor_payments);
  }

  /**
   * @returns the sales_avg in the block
   */
  public get sales_avg() {
    return new Monetary(this.data.sales_avg);
  }

  /**
   * @returns the status_counts in the block
   */
  public get status_counts() {
    return this.data.status_counts;
  }

  /**
   * @param value new value of the status_counts in the block
   * @protected
   */
  protected set status_counts(value) {
    this.data.status_counts = value;
  }

  /**
   * @param value new value of the actual_sold_products in the block
   * @protected
   */
  protected set actual_sold(value) {
    this.data.actual_sold_products = value;
  }

  /**
   * @param value new value of the timestamp in the block
   * @protected
   */
  protected set timestamp(value) {
    this.data.timestamp = value;
  }

  /**
   * @param value new value of the restocks in the block
   * @protected
   */
  protected set restocks(value) {
    this.data.restocks = value;
  }

  /**
   * @param value new value of the orders in the block
   * @protected
   */
  protected set orders(value) {
    this.data.orders = value;
  }

  /**
   * @param value new value of the expenses in the block
   * @protected
   */
  protected set expenses(value) {
    this.data.expenses = value;
  }

  /**
   * @param value new value of the sales in the block
   * @protected
   */
  protected set sales(value) {
    this.data.sales = value.data;
  }

  /**
   * @param value new value of the sold_products in the block
   * @protected
   */
  protected set sold_products(value) {
    this.data.sold_products = value;
  }

  /**
   * @param value new value of the sold_quantities in the block
   * @protected
   */
  protected set sold_quantities(value) {
    this.data.sold_quantities = value;
  }

  /**
   * @param value new value of the order_counts in the block
   * @protected
   */
  protected set order_counts(value) {
    this.data.order_counts = value;
  }

  /**
   * @param value new value of the profit in the block
   * @protected
   */
  protected set profit(value) {
    this.data.profit = value.data;
  }

  /**
   * @param value new value of the total_expenses in the block
   * @protected
   */
  protected set total_expenses(value) {
    this.data.total_expenses = value.data;
  }

  /**
   * @param value new value of the shipping_fees in the block
   * @protected
   */
  protected set shipping_fees(value) {
    this.data.shipping_fees = value.data;
  }

  /**
   * @param value new value of the employee_payments in the block
   * @protected
   */
  protected set employee_payments(value) {
    this.data.employee_payments = value.data;
  }

  /**
   * @param value new value of the vendor_payments in the block
   * @protected
   */
  protected set vendor_payments(value) {
    this.data.vendor_payments = value.data;
  }

  /**
   * @param value new value of the sales_avg in the block
   * @protected
   */
  protected set sales_avg(value) {
    this.data.sales_avg = value.data;
  }

  /**
   * @param order to be considered into the average
   * @param remove if true, the order is removed rather than added
   * @protected
   */
  protected recalibrateAverage(order: Order, remove?: boolean): void {
    let temp = this.sales_avg;

    temp.multiply(this.order_counts);

    if (remove) {
      temp.subtract(order.total ?? Monetary.noValue());
      temp.divide(this.order_counts - 1);
    } else {
      temp.add(order.total ?? Monetary.noValue());
      temp.divide(this.order_counts + 1);
    }

    this.sales_avg = temp;
  }

  /**
   * @param trail to extract the timestamp from
   * @returns the first timestamp of the trail
   * @protected
   */
  protected static extractTimestamp(trail: TrailType): string {
    return this.trimmedTimestamp(BaseModel.initialTimestamp(trail));
  }

  /**
   * @param timestamp to be trimmed
   * @returns a timestamp trimmed according to the accuracy
   * @protected
   */
  protected static trimmedTimestamp(timestamp: string): string {
    return timestamp.slice(0, this.accuracy);
  }

  /**
   * @param timestamp to be checked
   * @returns true if the timestamp is complete (yyyymmddhh)
   * @protected
   */
  protected static isCompleteTimestamp(timestamp: string): boolean {
    return timestamp.length === this.accuracy;
  }

  /**
   * @returns true if the instance of this timestamp is complete
   * @protected
   */
  protected get isAtomic(): boolean {
    return StatisticsBlock.isCompleteTimestamp(this.timestamp);
  }

  /**
   * @returns the moved quantities object in the block
   */
  public get moved_quantities() {
    return this.data.moved_quantities;
  }

  /**
   * @param value new value of moved_quantities
   * @protected
   */
  protected set moved_quantities(value) {
    this.data.moved_quantities = value;
  }

  /**
   * @returns the moved products in the block
   */
  public get moved_products() {
    return this.data.moved_products;
  }

  /**
   * @param value new moved products count in the block
   * @protected
   */
  protected set moved_products(value) {
    this.data.moved_products = value;
  }

  /**
   * @param restock to be added to this block
   * @private
   */
  protected addRestock(restock: Restock): void {
    if (this.restocks.indexOf(restock.id) === -1) {
      this.restocks.push(restock.id);
    }

    if (restock.isDeactivated) {
      return this.subtractRestock(restock);
    }

    const quantities = restock.quantities;

    for (let id of Object.keys(quantities)) {
      if (!(id in this.moved_quantities)) {
        this.moved_quantities[id] = 0;
      }

      this.moved_products += quantities[id];
      this.moved_quantities[id] += quantities[id];
    }

    if (this.isAtomic) {
      StatisticsBlock.addRestockToTimeline(restock);
    }

    this.save();
  }

  /**
   * @param order to be added to this block
   * @private
   */
  protected addOrder(order: Order): void {
    if (this.orders.indexOf(order.id) === -1) {
      this.orders.push(order.id);
    }

    const status = order.status;
    let notSkipDelivery = true;

    switch (status) {
      case OrderStatus.received_from_courier:
      case OrderStatus.pending:
        notSkipDelivery = !notSkipDelivery;
        break;
      case OrderStatus.confirmed:
      case OrderStatus.packaged:
      case OrderStatus.paid:
        this.sales = this.sales.addCopy(order.total ?? Monetary.noValue());
        this.profit = this.profit.addCopy(order.profit);
        this.recalibrateAverage(order);

        for (let usi of order.usiSet) {
          const id = Product.invertUsi(usi).id;

          if (!(id in this.sold_quantities)) {
            this.sold_quantities[id] = {
              aggregate: 0,
              actual: 0
            };
          }

          this.sold_quantities[id].aggregate += order.getQuantity(usi);
          this.sold_products += order.item_count;
          this.sold_quantities[id].actual += order.getQuantity(usi);
          this.actual_sold += order.item_count;
        }
        break;
      case OrderStatus.canceled_at_courier:
      case OrderStatus.canceled:
        this.sales = this.sales.subtractCopy(order.total ?? Monetary.noValue());
        this.profit = this.profit.subtractCopy(order.profit);

        for (let usi of order.usiSet) {
          const id = Product.invertUsi(usi).id;

          if (!(id in this.sold_quantities)) {
            this.sold_quantities[id] = {
              aggregate: 0,
              actual: 0
            };
          }

          this.sold_quantities[id].actual -= order.getQuantity(usi);
        }

        this.actual_sold -= order.item_count;
        break;
      default:
        throw new Error("Missing order status in statistics block");
    }

    if (notSkipDelivery) {
      const delivery = order.delivery?.copy() ?? Monetary.noValue();

      if (delivery.isNegative) {
        delivery.multiply(-1);
        this.shipping_fees = this.shipping_fees.addCopy(delivery);
        this.total_expenses = this.total_expenses.addCopy(delivery);
      }
    }

    this.status_counts[order.status].actual++;
    this.status_counts[order.status].aggregate++;
    this.order_counts++;

    if (this.isAtomic) {
      StatisticsBlock.addOrderToTimeline(order);
    }

    this.save();
  }

  /**
   * @param expense to be added to this block
   * @private
   */
  protected addExpense(expense: Expense): void {
    if (this.expenses.indexOf(expense.id) === -1) {
      this.expenses.push(expense.id);
    }

    if (expense.is_vendor || expense.is_invoice) {
      this.vendor_payments = this.vendor_payments.addCopy(expense.value);
    } else if (expense.is_employee) {
      this.employee_payments = this.employee_payments.addCopy(expense.value);
    } else if (expense.is_courier) {
      this.shipping_fees = this.shipping_fees.addCopy(expense.value);
    }

    this.total_expenses = this.total_expenses.addCopy(expense.value);

    if (this.isAtomic) {
      StatisticsBlock.addExpenseToTimeline(expense);
    }

    this.save();
  }

  /**
   * @param restock to be added into the statistics
   */
  public static addRestock(restock: Restock): void {
    this.getInstance(
      this.extractTimestamp(restock.trail)
    ).addRestock(restock);
  }

  /**
   * @param order to be added to the statistics
   */
  public static addOrder(order: Order): void {
    this.getInstance(
      this.extractTimestamp(order.trail)
    ).addOrder(order);
  }

  /**
   * @param expense to be added to the statistics
   */
  public static addExpense(expense: Expense): void {
    this.getInstance(
      this.invertDate(expense.date)
    ).addExpense(expense);
  }

  /**
   * @param restock to be subtracted from this statistics block
   * @private
   */
  protected subtractRestock(restock: Restock): void {
    const quantities = restock.quantities;

    for (let id of Object.keys(quantities)) {
      if (!(id in this.moved_quantities)) {
        this.moved_quantities[id] = 0;
      }

      this.moved_products -= quantities[id];
      this.moved_quantities[id] -= quantities[id];
    }

    if (this.isAtomic) {
      StatisticsBlock.subtractRestockFromTimeline(restock);
    }

    this.save()
  }

  /**
   * @param order to be subtracted from this statistics block
   * @private
   */
  protected subtractOrder(order: Order): void {
    const status = order.status;
    let notSkipDelivery = true;

    switch (status) {
      case OrderStatus.received_from_courier:
      case OrderStatus.pending:
        notSkipDelivery = !notSkipDelivery;
        break;
      case OrderStatus.confirmed:
      case OrderStatus.packaged:
      case OrderStatus.paid:
        this.sales = this.sales.subtractCopy(order.total ?? Monetary.noValue());
        this.profit = this.profit.subtractCopy(order.profit);
        this.recalibrateAverage(order, true);

        for (let usi of order.usiSet) {
          const id = Product.invertUsi(usi).id;

          if (!(id in this.sold_quantities)) {
            this.sold_quantities[id] = {
              aggregate: 0,
              actual: 0
            };
          }

          this.sold_quantities[id].actual -= order.getQuantity(usi);
          this.actual_sold -= order.item_count;
        }
        break;
      case OrderStatus.canceled_at_courier:
      case OrderStatus.canceled:
        this.sales = this.sales.addCopy(order.total ?? Monetary.noValue());
        this.profit = this.profit.addCopy(order.profit);

        for (let usi of order.usiSet) {
          const id = Product.invertUsi(usi).id;
          this.sold_quantities[id].actual += order.getQuantity(usi);
        }

        this.actual_sold += order.item_count;
        break;
      default:
        throw new Error("Missing order status in statistics block");
    }

    if (notSkipDelivery) {
      const delivery = order.delivery?.copy() ?? Monetary.noValue();

      if (delivery.isNegative) {
        delivery.multiply(-1);
        this.shipping_fees = this.shipping_fees.subtractCopy(delivery);
        this.total_expenses = this.total_expenses.subtractCopy(delivery);
      }
    }

    this.status_counts[order.status].actual--;
    this.order_counts--;

    if (this.isAtomic) {
      StatisticsBlock.subtractOrderFromTimeline(order);
    }

    this.save();
  }

  /**
   * @param expense to be subtracted from this statistics block
   * @private
   */
  protected subtractExpense(expense: Expense): void {
    if (expense.is_vendor || expense.is_invoice) {
      this.vendor_payments = this.vendor_payments.subtractCopy(expense.value);
    } else if (expense.is_employee) {
      this.employee_payments = this.employee_payments.subtractCopy(expense.value);
    } else if (expense.is_courier) {
      this.shipping_fees = this.shipping_fees.subtractCopy(expense.value);
    }

    this.total_expenses = this.total_expenses.subtractCopy(expense.value);

    if (this.isAtomic) {
      StatisticsBlock.subtractExpenseFromTimeline(expense);
    }

    this.save();
  }

  /**
   * @param restock to be subtracted from the current statistic block
   */
  public static subtractRestock(restock: Restock): void {
    this.getInstance(this.currentTimestamp).subtractRestock(restock);
  }

  /**
   * @param order to be subtracted from the current statistic block
   */
  public static subtractOrder(order: Order): void {
    this.getInstance(this.currentTimestamp).subtractOrder(order);
  }

  /**
   * @param expense to be subtracted from the current statistic block
   */
  public static subtractExpense(expense: Expense): void {
    this.getInstance(this.invertDate(expense.date)).subtractExpense(expense);
  }

  /**
   * @param other statistic block to be combined into the current instance
   */
  public combine(other: StatisticsBlock): void {
    if (this === other) {
      return;
    }

    this.sales = this.sales.addCopy(other.sales);
    this.sold_products += other.sold_products;
    this.actual_sold += other.actual_sold;
    this.restocks.push(...other.restocks);
    this.orders.push(...other.orders);
    this.expenses.push(...other.expenses);
    this.profit = this.profit.addCopy(other.profit);
    this.total_expenses = this.total_expenses.addCopy(other.total_expenses);
    this.shipping_fees = this.shipping_fees.addCopy(other.shipping_fees);
    this.employee_payments = this.employee_payments.addCopy(other.employee_payments);
    this.vendor_payments = this.vendor_payments.addCopy(other.vendor_payments);

    let tempThisAvg = this.sales_avg;
    tempThisAvg.multiply(this.sold_products);
    const tempAvg = other.sales_avg.multiplyCopy(other.sold_products);
    tempThisAvg.add(tempAvg);
    tempThisAvg.divide(this.sold_products + other.sold_products);
    this.sales_avg = tempThisAvg;

    this.order_counts += other.order_counts;

    // Handle quantities
    for (let productId of Object.keys(other.sold_quantities)) {
      if (!(productId in this.sold_quantities)) {
        this.sold_quantities[productId] = {
          aggregate: 0,
          actual: 0
        };
      }

      if (!(productId in this.moved_quantities)) {
        this.moved_quantities[productId] = 0;
      }

      this.sold_quantities[productId].actual +=
        other.sold_quantities[productId].actual;
      this.sold_quantities[productId].aggregate +=
        other.sold_quantities[productId].aggregate;
      this.moved_products += other.moved_products;
    }

    for (let status of Object.keys(this.status_counts)) {
      // @ts-ignore
      this.status_counts[status].actual += other.status_counts[status].actual;
      // @ts-ignore
      this.status_counts[status].aggregate += other.status_counts[status].aggregate;
    }
  }

  /**
   * @param restock to be added to the timeline
   *        (i.e. to the year, month, & day).
   * @protected
   */
  protected static addRestockToTimeline(restock: Restock): void {
    const timestamp = this.extractTimestamp(restock.trail);
    const year = timestamp.slice(0, 4);
    const month = timestamp.slice(0, 6);
    const day = timestamp.slice(0, 8);

    this.getInstance(year).addRestock(restock);
    this.getInstance(month).addRestock(restock);
    this.getInstance(day).addRestock(restock);
  }

  /**
   * @param order to be added to the timeline
   *        (i.e. to the year, month, & day).
   * @protected
   */
  protected static addOrderToTimeline(order: Order): void {
    const timestamp = this.extractTimestamp(order.trail);
    const year = timestamp.slice(0, 4);
    const month = timestamp.slice(0, 6);
    const day = timestamp.slice(0, 8);

    this.getInstance(year).addOrder(order);
    this.getInstance(month).addOrder(order);
    this.getInstance(day).addOrder(order);
  }

  /**
   * @param expense to be added to the timeline
   *        (i.e. to the year, month, & day).
   * @protected
   */
  protected static addExpenseToTimeline(expense: Expense): void {
    const timestamp = this.invertDate(expense.date);
    const year = timestamp.slice(0, 4);
    const month = timestamp.slice(0, 6);
    const day = timestamp.slice(0, 8);

    this.getInstance(year).addExpense(expense);
    this.getInstance(month).addExpense(expense);
    this.getInstance(day).addExpense(expense);
  }

  /**
   * @param restock to be subtracted from the timeline
   *        (i.e. to the year, month, & day).
   * @protected
   */
  protected static subtractRestockFromTimeline(restock: Restock): void {
    const timestamp = this.extractTimestamp(restock.trail);
    const year = timestamp.slice(0, 4);
    const month = timestamp.slice(0, 6);
    const day = timestamp.slice(0, 8);

    this.getInstance(year).subtractRestock(restock);
    this.getInstance(month).subtractRestock(restock);
    this.getInstance(day).subtractRestock(restock);
  }

  /**
   * @param order to be subtracted from the timeline
   *        (i.e. to the year, month, & day).
   * @protected
   */
  protected static subtractOrderFromTimeline(order: Order): void {
    const timestamp = this.extractTimestamp(order.trail);
    const year = timestamp.slice(0, 4);
    const month = timestamp.slice(0, 6);
    const day = timestamp.slice(0, 8);

    this.getInstance(year).subtractOrder(order);
    this.getInstance(month).subtractOrder(order);
    this.getInstance(day).subtractOrder(order);
  }

  /**
   * @param expense to be subtracted from the timeline
   *        (i.e. to the year, month, & day).
   * @protected
   */
  protected static subtractExpenseFromTimeline(expense: Expense): void {
    const timestamp = this.invertDate(expense.date);
    const year = timestamp.slice(0, 4);
    const month = timestamp.slice(0, 6);
    const day = timestamp.slice(0, 8);

    this.getInstance(year).subtractExpense(expense);
    this.getInstance(month).subtractExpense(expense);
    this.getInstance(day).subtractExpense(expense);
  }

  /**
   * @returns the current timestamp
   */
  public static get currentTimestamp(): string {
    return this.invertDate(new Date());
  }

  /**
   * @returns timestamp wrapped in a Date instance
   */
  public get date(): Date {
    return StatisticsBlock.wrapTimestamp(this.timestamp);
  }

  /**
   * @returns the year in the timestamp
   */
  public get year(): string {
    return this.dissected_timestamp.year;
  }

  /**
   * @returns the month in the timestamp
   */
  public get month(): string {
    return this.dissected_timestamp.month;
  }

  /**
   * @returns the day in the timestamp
   */
  public get day(): string {
    return this.dissected_timestamp.day;
  }

  /**
   * @returns the hour in the timestamp
   */
  public get hour(): string {
    return this.dissected_timestamp.hour;
  }

  /**
   * Saves the block data into cache
   */
  public save(): void {
    if (this.empty) {
      this.delete();
      return;
    }

    StatisticsBlock.setValue(this.timestamp, this.data);
  }

  /**
   * Deletes the block data from cache
   */
  public delete(): void {
    this.storage.delete(this.timestamp);
  }

  /**
   * @returns true if the current block is the same as no value
   */
  public get empty(): boolean {
    return isEqual(StatisticsBlock.noValue(this.timestamp), this.data);
  }

  /**
   * @param key to be inserted
   * @param data represented by the key
   * @private
   */
  protected static setValue(key: string, data: statisticsBlock): void {
    this.storage.set(key, JSON.stringify(data));
  }

  /**
   * @param key to be fetched from cache
   * @returns the raw data of the statistics block represented by the key
   * @private
   */
  protected static getValue(key: string): statisticsBlock {
    return JSON.parse(
      this.storage.getString(key) as string
    ) as statisticsBlock;
  }

  /**
   * @param key to be fetched from cache
   * @returns the raw data wrapped in a StatisticsBlock
   * @private
   */
  protected static getInstance(key: string): StatisticsBlock {
    key = this.trimmedTimestamp(key);

    if (!this.checkCache(key)) {
      return this.noValue(key);
    }

    return new StatisticsBlock(this.getValue(key));
  }

  /**
   * @param year in the form of yyyy
   * @returns the statistics of the given year
   */
  public static getYearStatistics(year: string): StatisticsBlock {
    return this.getInstance(year);
  }

  /**
   * @param month in the form of yyyymm
   * @returns the statistics of the given month
   */
  public static getMonthStatistics(month: string): StatisticsBlock {
    return this.getInstance(month);
  }

  /**
   * @param day in form of yyyymmdd
   * @returns the statistics of the given day
   */
  public static getDayStatistics(day: string): StatisticsBlock {
    return this.getInstance(day);
  }

  /**
   * @param hour in form of yyyymmddhh
   * @returns the statistics of the given hour
   */
  public static getHourStatistics(hour: string): StatisticsBlock {
    return this.getInstance(hour);
  }

  /**
   * @param key to be checked
   * @returns true if the key is in cache, otherwise false
   */
  public static checkCache(key: string): boolean {
    return this.storage.contains(key);
  }

  /**
   * @returns default zeroed order counts
   * @private
   */
  protected static get zeroOrderCounts() {
    const zero = {
      actual: 0,
      aggregate: 0
    };

    return {
      [OrderStatus.pending]: BaseModel.deepCopy(zero),
      [OrderStatus.confirmed]: BaseModel.deepCopy(zero),
      [OrderStatus.packaged]: BaseModel.deepCopy(zero),
      [OrderStatus.sent_to_courier]: BaseModel.deepCopy(zero),
      [OrderStatus.paid]: BaseModel.deepCopy(zero),
      [OrderStatus.canceled]: BaseModel.deepCopy(zero),
      [OrderStatus.canceled_at_courier]: BaseModel.deepCopy(zero),
      [OrderStatus.received_from_courier]: BaseModel.deepCopy(zero)
    }
  }

  /**
   * @param timestamp to represent the block
   * @returns a zero value statistics block
   */
  public static noValue(timestamp: string): StatisticsBlock {
    return new StatisticsBlock({
      timestamp: timestamp,
      sales: Monetary.noValue().data,
      orders: [],
      restocks: [],
      expenses: [],
      sold_quantities: {},
      moved_quantities: {},
      status_counts: this.zeroOrderCounts,
      profit: Monetary.noValue().data,
      total_expenses: Monetary.noValue().data,
      shipping_fees: Monetary.noValue().data,
      employee_payments: Monetary.noValue().data,
      vendor_payments: Monetary.noValue().data,
      sales_avg: Monetary.noValue().data,
      order_counts: 0,
      actual_sold_products: 0,
      moved_products: 0,
      sold_products: 0,
    });
  }

  /**
   * @param t0 first timestamp
   * @param t1 second timestamp
   * @param unit time unit
   * @returns combined statisticsBlocks from [t0, t1] under step 'unit'.
   * @private
   */
  protected static combineFromTo(t0: string,
                           t1: string,
                           unit: TimeUnit): StatisticsBlock {
    let result: StatisticsBlock = this.noValue(`${t0}->${t1}`) ;

    while (t0 < t1) {
      result.combine(this.getInstance(t0));
      t0 = this.incrementTimestamp(t0, unit);
    }

    return result;
  }

  /**
   * If any year in the statistics is not present, it is substituted by a
   * no value.
   *
   * @param y0 starting year
   * @param y1 end year
   * @returns combined statistics from [y0, y1].
   */
  public static combineFromYearTo(y0: string, y1: string): StatisticsBlock {
    return this.combineFromTo(y0, y1, TimeUnit.year);
  }

  /**
   * If any month in the statistics is not present, it is substituted by a
   * no value.
   *
   * @param m0 starting month
   * @param m1 end month
   * @returns combined statistics from [m0, m1].
   */
  public static combineFromMonthTo(m0: string, m1: string): StatisticsBlock {
    return this.combineFromTo(m0, m1, TimeUnit.month);
  }

  /**
   * If any day in the statistics is not present, it is substituted by a
   * no value.
   *
   * @param d0 starting day
   * @param d1 end day
   * @returns combined statistics from [d0, d1].
   */
  public static combineFromDayTo(d0: string, d1: string): StatisticsBlock {
    return this.combineFromTo(d0, d1, TimeUnit.day);
  }

  /**
   * If any hour in the statistics is not present, it is substituted by a
   * no value.
   *
   * @param h0 starting hour
   * @param h1 end hour
   * @returns combined statistics from [h0, h1].
   */
  public static combineFromHourTo(h0: string, h1: string): StatisticsBlock {
    return this.combineFromTo(h0, h1, TimeUnit.hour);
  }

  /**
   * @param t0 first timestamp
   * @param t1 second timestamp
   * @param unit time unit
   * @param map applied to each block in the timeframe
   * @returns List of statisticsBlocks information from [t0, t1] under step 'unit'.
   * @private
   */
  protected static getFromTo(
    t0: string,
    t1: string,
    unit: TimeUnit,
    map?: MappingFunction): any[] {
    if (map === undefined) {
      map = defaultMapping;
    }

    let result: StatisticsBlock[] = [];
    let currentTimestamp = t0;

    while (currentTimestamp < t1) {
      result.push(map(this.getInstance(currentTimestamp)));
      currentTimestamp = this.incrementTimestamp(currentTimestamp, unit);
    }

    return result;
  }

  /**
   * If any year in the statistics is not present, it is substituted by a
   * no value.
   *
   * @param y0 starting year
   * @param y1 end year
   * @param map applied to each block in the timeframe
   * @returns array of statistics from [y0, y1].
   */
  public static getFromYearTo(y0: string,
                              y1: string,
                              map?: MappingFunction): StatisticsBlock[] {
    return this.getFromTo(y0, y1, TimeUnit.year, map);
  }

  /**
   * If any month in the statistics is not present, it is substituted by a
   * no value.
   *
   * @param m0 starting month
   * @param m1 end month
   * @param map applied to each block in the timeframe
   * @returns array of statistics from [m0, m1].
   */
  public static getFromMonthTo(m0: string,
                               m1: string,
                               map?: MappingFunction): StatisticsBlock[] {
    return this.getFromTo(m0, m1, TimeUnit.month, map);
  }

  /**
   * If any day in the statistics is not present, it is substituted by a
   * no value.
   *
   * @param d0 starting day
   * @param d1 end day
   * @param map applied to each block in the timeframe
   * @returns array of statistics from [d0, d1].
   */
  public static getFromDayTo(d0: string,
                             d1: string,
                             map?: MappingFunction): StatisticsBlock[] {
    return this.getFromTo(d0, d1, TimeUnit.day, map);
  }

  /**
   * If any hour in the statistics is not present, it is substituted by a
   * no value.
   *
   * @param h0 starting hour
   * @param h1 end hour
   * @param map applied to each block in the timeframe
   * @returns array of statistics from [h0, h1].
   */
  public static getFromHourTo(h0: string,
                              h1: string,
                              map?: MappingFunction): StatisticsBlock[] {
    return this.getFromTo(h0, h1, TimeUnit.hour, map);
  }

  /**
   * @param date to be incremented by 1 year
   * @param unit time unit to increment by
   */
  public static incrementDate(date: Date, unit: TimeUnit): void {
    switch (unit) {
      case TimeUnit.year:
        date.setFullYear(date.getFullYear() + 1);
        break;
      case TimeUnit.month:
        date.setMonth(date.getMonth() + 1);
        break;
      case TimeUnit.day:
        date.setDate(date.getDate() + 1);
        break;
      case TimeUnit.hour:
        date.setHours(date.getHours() + 1);
        break;
    }
  }

  /**
   * @param timestamp to be incremented
   * @param unit unit of incrementation
   * @returns incremented timestamp by date
   */
  public static incrementTimestamp(timestamp: string, unit: TimeUnit): string {
    let date = this.wrapTimestamp(timestamp);
    this.incrementDate(date, unit);
    return this.invertDate(date);
  }

  /**
   * @param timestamp to be dissected
   * @returns a dissected timestamp object of the timestamp info
   * @protected
   */
  protected static dissectTimestamp(timestamp: string): dissectedTimestamp {
    return {
      year: timestamp.slice(0, 4),
      month: timestamp.slice(4, 6).padStart(2, '0'),
      day: timestamp.slice(6, 8).padStart(2, '0'),
      hour: timestamp.slice(8, 10).padStart(2, '0')
    };
  }

  /**
   * @param timestamp to be wrapped
   * @returns a timestamp wrapped by a date instance
   * @protected
   */
  protected static wrapTimestamp(timestamp: string): Date {
    const temp = this.dissectTimestamp(timestamp);

    return new Date(
      Number.parseInt(temp.year),
      Number.parseInt(temp.month),
      Number.parseInt(temp.day),
      Number.parseInt(temp.hour)
    );
  }

  /**
   * @param date to be inverted
   * @returns the timestamp of the date
   * @protected
   */
  protected static invertDate(date: Date): string {
    return [
      date.getFullYear(),
      date.getMonth().toString().padStart(2, '0'),
      date.getDate().toString().padStart(2, '0'),
      date.getHours().toString().padStart(2, '0'),
    ].join('');
  }

  /**
   * @param collection_name
   * @returns the collection ID for statistics
   * @private
   */
  protected static formId(collection_name: string): string {
    return `${this.isLoadedId}-${collection_name}`;
  }

  /**
   * @returns true if the statistics have been loaded previously
   */
  public static isLoaded(collection_name: string): boolean {
    const id = this.formId(collection_name);
    let result = this.storage.getBoolean(id);

    if (result === undefined) {
      return false;
    }

    return result;
  }

  /**
   * Sets the loaded flag
   */
  public static setLoaded(collection_name: string): void {
    this.storage.set(this.formId(collection_name), true);
  }

  /**
   * @returns the orders object in the data
   */
  public get orders() {
    return this.data.orders;
  }

  /**
   * @returns the restocks object in the data
   */
  public get restocks() {
    return this.data.restocks;
  }

  /**
   * @returns the expenses object in the data
   */
  public get expenses() {
    return this.data.expenses;
  }

  /**
   * @returns the data value
   */
  public get data(): statisticsBlock {
    return this.dataValue;
  }

  /**
   * @param value new value of the raw data
   */
  public set data(value) {
    this.dataValue = value;
  }
}
