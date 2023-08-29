import { dissectedTimestamp, Generic, OrderStatus, statisticsBlock, TrailType } from "../model/types";
import { MMKV } from "react-native-mmkv";
import CollectionInfo from "../../../CollectionInfo";
import Monetary from "./Monetary";
import BaseModel from "../model/BaseModel";
import Restock from "../model/Restock";
import Order from "../model/Order";
import Expense from "../model/Expense";
import { isEqual } from "lodash";


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
  private get storage() {
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
   * @protected
   */
  protected recalibrateAverage(order: Order): void {
    let temp = this.sales_avg;

    temp.multiply(this.order_counts);
    temp.add(order.total ?? Monetary.noValue());
    temp.divide(this.order_counts + 1);

    this.sales_avg = temp;
  }

  /**
   * @param trail to extract the timestamp from
   * @returns the most recent timestamp of the trail
   * @protected
   */
  protected static extractTimestamp(trail: TrailType): string {
    return BaseModel.getLastTimestamp(trail).slice(0, this.accuracy);
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
  protected get isComplete(): boolean {
    return StatisticsBlock.isCompleteTimestamp(this.timestamp);
  }

  /**
   * @param restock to be added to this block
   * @private
   */
  private addRestock(restock: Restock): void {
    if (restock.order_linked) {
      this.restocks.push(restock.id);

      this.sold_products += restock.item_count;
      this.actual_sold += restock.item_count;
      const quantities = restock.quantities;

      for (let id of Object.keys(quantities)) {
        if (!(id in this.sold_quantities)) {
          this.sold_quantities[id] = 0;
        }

        this.sold_quantities[id] += quantities[id];
      }

      if (this.isComplete) {
        StatisticsBlock.addRestockToTimeline(restock);
      }

      this.save();
    }
  }

  /**
   * @param order to be added to this block
   * @private
   */
  private addOrder(order: Order): void {
    this.orders.push(order.id);

    if (order.status !== OrderStatus.pending) {
      this.sales = this.sales.addCopy(order.total ?? Monetary.noValue());
      this.profit = this.profit.addCopy(order.profit);
      this.recalibrateAverage(order);

      const delivery = order.delivery?.copy() ?? Monetary.noValue();

      if (delivery.isNegative) {
        delivery.multiply(-1);
        this.shipping_fees = this.shipping_fees.addCopy(delivery);
        this.total_expenses = this.total_expenses.addCopy(delivery);
      }
    }

    this.status_counts[order.status]++;
    this.order_counts++;

    if (this.isComplete) {
      StatisticsBlock.addOrderToTimeline(order);
    }

    this.save();
  }

  /**
   * @param expense to be added to this block
   * @private
   */
  private addExpense(expense: Expense): void {
    this.expenses.push(expense.id);

    if (expense.is_vendor || expense.is_invoice) {
      this.vendor_payments = this.vendor_payments.addCopy(expense.value);
    } else if (expense.is_employee) {
      this.employee_payments = this.employee_payments.addCopy(expense.value);
    } else if (expense.is_courier) {
      this.shipping_fees = this.shipping_fees.addCopy(expense.value);
    }

    this.total_expenses = this.total_expenses.addCopy(expense.value);

    if (this.isComplete) {
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
   * @param restock to be removed from this statistics block
   * @private
   */
  private removeRestock(restock: Restock): void {
    this.actual_sold -= restock.item_count;

    if (this.isComplete) {
      StatisticsBlock.removeRestockFromTimeline(restock);
    }

    this.save()
  }

  /**
   * @param order to be removed from this statistics block
   * @private
   */
  private removeOrder(order: Order): void {
    if (order.status !== OrderStatus.pending) {
      this.sales = this.sales.subtractCopy(order.total ?? Monetary.noValue());
      this.profit = this.profit.subtractCopy(order.profit);
    }

    if (this.isComplete) {
      StatisticsBlock.removeOrderFromTimeline(order);
    }

    this.save()
  }

  /**
   * @param expense to be removed from this statistics block
   * @private
   */
  private removeExpense(expense: Expense): void {
    const index = this.expenses.indexOf(expense.id);

    if (index === -1) {
      return;
    }

    this.expenses.splice(index, 1);

    if (expense.is_vendor || expense.is_invoice) {
      this.vendor_payments = this.vendor_payments.subtractCopy(expense.value);
    } else if (expense.is_employee) {
      this.employee_payments = this.employee_payments.subtractCopy(expense.value);
    } else if (expense.is_courier) {
      this.shipping_fees = this.shipping_fees.subtractCopy(expense.value);
    }

    this.total_expenses = this.total_expenses.subtractCopy(expense.value);

    if (this.isComplete) {
      StatisticsBlock.removeExpenseFromTimeline(expense);
    }

    this.save();
  }

  /**
   * @param restock to be removed from the current statistic block
   */
  public static removeRestock(restock: Restock): void {
    this.getInstance(this.currentTimestamp).removeRestock(restock);
  }

  /**
   * @param order to be removed from the current statistic block
   */
  public static removeOrder(order: Order): void {
    this.getInstance(this.currentTimestamp).removeOrder(order);
  }

  /**
   * @param expense to be removed from the current statistic block
   */
  public static removeExpense(expense: Expense): void {
    this.getInstance(this.invertDate(expense.date)).removeExpense(expense);
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

    for (let productId of Object.keys(other.sold_quantities)) {
      this.sold_quantities[productId] += other.sold_quantities[productId];
    }

    for (let status of Object.keys(this.status_counts)) {
      // @ts-ignore
      this.status_counts[status] += other.status_counts[status];
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
  protected static removeRestockFromTimeline(restock: Restock): void {
    const timestamp = this.extractTimestamp(restock.trail);
    const year = timestamp.slice(0, 4);
    const month = timestamp.slice(0, 6);
    const day = timestamp.slice(0, 8);

    this.getInstance(year).removeRestock(restock);
    this.getInstance(month).removeRestock(restock);
    this.getInstance(day).removeRestock(restock);
  }

  /**
   * @param order to be subtracted from the timeline
   *        (i.e. to the year, month, & day).
   * @protected
   */
  protected static removeOrderFromTimeline(order: Order): void {
    const timestamp = this.extractTimestamp(order.trail);
    const year = timestamp.slice(0, 4);
    const month = timestamp.slice(0, 6);
    const day = timestamp.slice(0, 8);

    this.getInstance(year).removeOrder(order);
    this.getInstance(month).removeOrder(order);
    this.getInstance(day).removeOrder(order);
  }

  /**
   * @param expense to be subtracted from the timeline
   *        (i.e. to the year, month, & day).
   * @protected
   */
  protected static removeExpenseFromTimeline(expense: Expense): void {
    const timestamp = this.invertDate(expense.date);
    const year = timestamp.slice(0, 4);
    const month = timestamp.slice(0, 6);
    const day = timestamp.slice(0, 8);

    this.getInstance(year).removeExpense(expense);
    this.getInstance(month).removeExpense(expense);
    this.getInstance(day).removeExpense(expense);
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
  private static setValue(key: string, data: Generic): void {
    this.storage.set(key, JSON.stringify(data));
  }

  /**
   * @param key to be fetched from cache
   * @returns the raw data of the statistics block represented by the key
   * @private
   */
  private static getValue(key: string): statisticsBlock {
    return JSON.parse(
      this.storage.getString(key) as string
    ) as statisticsBlock;
  }

  /**
   * @param key to be fetched from cache
   * @returns the raw data wrapped in a StatisticsBlock
   * @private
   */
  private static getInstance(key: string): StatisticsBlock {
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
  private static get zeroOrderCounts() {
    return {
      [OrderStatus.pending]: 0,
      [OrderStatus.confirmed]: 0,
      [OrderStatus.packaged]: 0,
      [OrderStatus.sent_to_courier]: 0,
      [OrderStatus.paid]: 0,
      [OrderStatus.canceled]: 0,
      [OrderStatus.canceled_at_courier]: 0,
      [OrderStatus.received_from_courier]: 0,
      [OrderStatus.finalized]: 0,
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
      sold_products: 0,
      orders: [],
      restocks: [],
      expenses: [],
      sold_quantities: {},
      status_counts: this.zeroOrderCounts,
      profit: Monetary.noValue().data,
      total_expenses: Monetary.noValue().data,
      shipping_fees: Monetary.noValue().data,
      employee_payments: Monetary.noValue().data,
      vendor_payments: Monetary.noValue().data,
      sales_avg: Monetary.noValue().data,
      order_counts: 0,
      actual_sold_products: 0
    });
  }

  /**
   * @param t0 first timestamp
   * @param t1 second timestamp
   * @param unit time unit
   * @returns combined statisticsBlocks from [t0, t1] under step 'unit'.
   * @private
   */
  private static combineFromTo(t0: string,
                           t1: string,
                           unit: TimeUnit): StatisticsBlock {
    const date1 = this.wrapTimestamp(t1);
    let result: StatisticsBlock = this.noValue(`${t0}${t1}`) ;
    let current = this.getInstance(t0);
    result.combine(current)

    while (current.date < date1) {
      this.incrementDate(result.date, unit);
      result.combine(current);
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
   * @returns List of statisticsBlocks from [t0, t1] under step 'unit'.
   * @private
   */
  private static getFromTo(t0: string,
                           t1: string,
                           unit: TimeUnit): StatisticsBlock[] {
    let result: StatisticsBlock[] = [];
    let currentTimestamp = t0;

    while (currentTimestamp < t1) {
      result.push(this.getInstance(currentTimestamp));
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
   * @returns array of statistics from [y0, y1].
   */
  public static getFromYearTo(y0: string, y1: string): StatisticsBlock[] {
    return this.getFromTo(y0, y1, TimeUnit.year);
  }

  /**
   * If any month in the statistics is not present, it is substituted by a
   * no value.
   *
   * @param m0 starting month
   * @param m1 end month
   * @returns array of statistics from [m0, m1].
   */
  public static getFromMonthTo(m0: string, m1: string): StatisticsBlock[] {
    return this.getFromTo(m0, m1, TimeUnit.month);
  }

  /**
   * If any day in the statistics is not present, it is substituted by a
   * no value.
   *
   * @param d0 starting day
   * @param d1 end day
   * @returns array of statistics from [d0, d1].
   */
  public static getFromDayTo(d0: string, d1: string): StatisticsBlock[] {
    return this.getFromTo(d0, d1, TimeUnit.day);
  }

  /**
   * If any hour in the statistics is not present, it is substituted by a
   * no value.
   *
   * @param h0 starting hour
   * @param h1 end hour
   * @returns array of statistics from [h0, h1].
   */
  public static getFromHourTo(h0: string, h1: string): StatisticsBlock[] {
    return this.getFromTo(h0, h1, TimeUnit.hour);
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
  private static formId(collection_name: string): string {
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
