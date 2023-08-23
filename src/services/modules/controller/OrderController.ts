import BaseController, { ControllerFlag } from "./BaseController";
import {
  basicOrder,
  Generic,
  MonetaryType,
  order,
  OrderSearchSchema,
  OrderStatus,
  QuantityType,
  SpecialFields,
  TrailNature
} from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionInfo from "../../../CollectionInfo";
import Order from "../model/Order";
import {
  IdDoesNotExistError,
  InsufficientQuantitiesError,
  NoCancelError,
  OrderNotAtCourierError,
  OrderNotConfirmedNorPendingError,
  OrderNotPendingError
} from "./Errors";
import RestockController from "./RestockController";
import CourierController from "./CourierController";
import CustomerController from "./CustomerController";
import Monetary from "../local_model/Monetary";
import Employee from "../model/Employee";
import { reduxStorage } from "../../../store";
import ReduxParameters from "../../../ReduxParameters";
import BaseModel from "../model/BaseModel";
import Restock from "../model/Restock";


/**
 * Class responsible for handling operations on the orders' collection.
 */
export default class OrderController extends BaseController<order> {
  private static readonly flag: number =
    ControllerFlag.can_update
    | ControllerFlag.has_trail
    | ControllerFlag.pivot_not_list;

  /**
   * @param server firestore instance for the database
   */
  public constructor(server?: typeof firestore) {
    super(
      CollectionInfo.order.name,
      CollectionInfo.order.id,
      server ?? firestore,
      OrderController.flag,
      OrderSearchSchema
    );

    this.loadSearchData().then(() => {
      this.activateListener();
      this.injectDependency();
    });
  }

  /**
   * @returns the restocks controller for the server,
   *          in the injected dependencies
   */
  public get restockController(): RestockController {
    return BaseController.getDependency(
      CollectionInfo.restock.name,
      RestockController,
      this.metaServer
    );
  }

  /**
   * @returns the pending pivot storage ID name
   * @private
   */
  private get pendingPivotName() {
    return this.uniqueId(this.collectionName) + "-pending-pivot";
  }

  /**
   * @param increment if true, increments the pending pivot by 1
   * @returns the local pending pivot
   */
  public pendingPivot(increment?: boolean) {
    if (!this.checkCache(this.pendingPivotName)) {
      this.storage.set(this.pendingPivotName, 0);
    }

    let pivot = this.storage.getNumber(this.pendingPivotName) as number;

    if (increment) {
      pivot++;
    }

    return pivot;
  }

  /**
   * @returns the couriers controller for the server,
   *          in the injected dependencies
   */
  public get courierController(): CourierController {
    return BaseController.getDependency(
      CollectionInfo.courier.name,
      CourierController,
      this.metaServer
    );
  }

  /**
   * @returns the stored current employee instance
   */
  public get currentEmployee(): Employee | undefined {
    const data = reduxStorage.getItem(
      ReduxParameters.currentEmployee
    );

    return data === undefined ? undefined : new Employee(data);
  }

  /**
   * @returns the customers controller for the server,
   *          in the injected dependencies
   */
  public get customerController(): CustomerController {
    return BaseController.getDependency(
      CollectionInfo.customer.name,
      CustomerController,
      this.metaServer
    );
  }

  /**
   * @param id of the order to be fetched
   * @returns order model
   * @throws IdDoesNotExistError if the id does not belong to an order
   */
  public async get(id: string): Promise<Order> {
    if (id === this.pendingPivotName || await this.isIdAvailable(id)) {
      throw new IdDoesNotExistError();
    }

    const orderData = await this.getData(id) as order;

    let restock = undefined;
    if (orderData.restock_id !== undefined) {
      restock = await this.restockController.get(orderData.restock_id);
    }

    let courier = undefined;
    if (orderData.courier_id !== undefined) {
      courier = await this.courierController.get(orderData.courier_id);
    }

    const customer = await this.customerController.get(
      orderData.customer_id
    );

    let link = undefined;
    if (orderData.link_id !== undefined && orderData.link_id !== id) {
      link = await this.get(orderData.link_id);
    }

    return new Order(orderData, restock as Restock, customer, courier, link);
  }

  /**
   * @param data basic raw data to create an order
   * @throws InsufficientQuantitiesError if the name of the order is taken
   */
  public async create(data: basicOrder): Promise<string> {
    if (data.status === OrderStatus.pending) {
      const id = `pending_${this.pendingPivot(true)}`;

      // Pending local
      await this.setCache(id, this.fillDataGaps(data));

      return id;
    }

    try {
      data.restock_id = await this.restockController.create({
        note: this.generateNote(data),
        to_inventory: Order.isStatusToInventory(data.status),
        quantities: this.getQuantities(data),
        order_linked: true
      });

      data.id = await this.generateId();

      try {
        await this.createServer(data.id, this.fillDataGaps(data));
      } catch (e) {

      }

      return data.id;
    } catch (e) {
      if (e instanceof EvalError) {
        throw new InsufficientQuantitiesError();
      } else {
        throw e;
      }
    }
  }

  /**
   * @param id of the order to be confirmed and created.
   */
  public async confirm(id: string) {
    if (!this.checkCache(id)) {
      throw new OrderNotPendingError();
    }

    const order = await this.get(id);
    const oldId = order.id;

    await this.create(order.getBasicData(OrderStatus.confirmed));
    this.removeCache(oldId);
  }

  /**
   * @param id of the order to be packaged.
   */
  public async package(id: string) {
    const order = await this.get(id);

    if (order.status === OrderStatus.pending) {
      const oldId = order.id;
      await this.create(order.getBasicData(OrderStatus.packaged));
      this.removeCache(oldId);
    } else if (order.status === OrderStatus.confirmed) {
      order.status = OrderStatus.packaged;

      await this.updateQuantities(id, order.quantities, true);
    } else {
      throw new OrderNotConfirmedNorPendingError()
    }
  }

  /**
   * @param id of the old order
   * @param exchangeOrder new order to be placed, and linked to the old order
   */
  public async exchange(id: string, exchangeOrder: basicOrder) {
    if (await this.isIdAvailable(id)) {
      throw new IdDoesNotExistError();
    }

    exchangeOrder.link_id = id;
    let order = await this.get(id);
    order.link_id = await this.create(exchangeOrder);

    await this.update(order);
  }

  /**
   * @param id of the order to be sent to the courier
   */
  public async sendToCourier(id: string) {
    let order = await this.get(id);
    order.status = OrderStatus.sent_to_courier;

    await this.update(order);
  }

  /**
   * @param id of the order to be marked as paid
   * @param payment by the customer for the order
   * @param delivery charges paid by the customer
   */
  public async pay(id: string,
                   payment: Monetary,
                   delivery: Monetary) {
    let order = await this.get(id);
    order.status = OrderStatus.paid;
    order.delivery = delivery;
    order.payment = payment;

    await this.update(order);
  }

  /**
   * @param id of the order to be canceled
   */
  public async cancel(id: string) {
    let order = await this.get(id);

    if (order.status === OrderStatus.pending) {
      this.removeCache(id);
      return;
    }

    switch (order.status) {
      case OrderStatus.confirmed:
        order.status = OrderStatus.canceled;
        order.restock.to_inventory = false;
        break;
      case OrderStatus.packaged:
        order.status = OrderStatus.canceled;
        order.restock.to_inventory = undefined;
        break;
      case OrderStatus.paid:
      case OrderStatus.sent_to_courier:
        order.status = OrderStatus.canceled_at_courier;
        order.restock.to_inventory = false;
        break;
      default:
        throw new NoCancelError();
    }

    await this.restockController.revoke(
      order.restock.id,
      order.restock.to_inventory
    );

    // Deactivate a canceled order
    this.stamp(order.trail, TrailNature.D);
    await this.update(order);
  }

  /**
   * @param id of the order to be received from the courier
   */
  public async receive(id: string) {
    let order = await this.get(id);

    if (order.status !== OrderStatus.canceled_at_courier) {
      throw new OrderNotAtCourierError();
    }

    await this.updateQuantities(
      id,
      order.restock.negativeQuantities,
      true
    );

    order.status = OrderStatus.received_from_courier;
    await this.update(order);
  }

  /**
   * @returns the ID of an order, based on the current pivot
   */
  public async generateId(): Promise<string> {
    const idDoc = await this.idSetDocument.get();

    if (!idDoc.exists) {
      await this.idSetDocument.set({
        data: this.pivot
      });
    }

    return await this.runTransaction(async (transaction) => {
      let newPivot =
        (await transaction.get(this.idSetDocument)).data()?.data + 1;

      await transaction.update(this.idSetDocument, {
        data: newPivot
      });

      return newPivot.toString();
    });
  }

  /**
   * @param model new model of the order
   * @throws IdDoesNotExistError if the order does not exist
   */
  public async update(model: Order) {
    if (this.pivot < Number(model.id)) {
      throw new IdDoesNotExistError();
    }

    const currentData: Generic | undefined = this.getCache(model.id);
    const data: Generic | undefined = model.dataCopy;

    if (currentData === undefined) {
      await this.updateServer(data, model.id);
      return;
    }

    BaseController.clearAlikeFieldsFromNew(currentData, data);

    await this.updateServer(data, model.id);
  }

  /**
   * @param id of the order
   * @param newQuantities of the order
   * @param to_inventory if true updates only inventory quantities,
   *        if false updates only display quantities,
   *        if undefined updates both
   */
  public async updateQuantities(id: string,
                                newQuantities: QuantityType,
                                to_inventory: boolean | undefined) {
    let order = await this.get(id);

    try {
      await this.restockController.updateQuantities(
        order.restock.id, newQuantities, to_inventory
      );

      order.total = new Monetary(
        this.generateTotal(order.getBasicData(order.status))
      );

      await this.update(order);
    } catch (e) {
      if (e instanceof EvalError) {
        throw new InsufficientQuantitiesError();
      } else {
        throw e;
      }
    }
  }

  /**
   * @param data to generate the total for
   * @returns the total monetary value for the order, not accounting
   *          for discounts or delivery.
   */
  public generateTotal(data: basicOrder): MonetaryType {
    let result = Monetary.noValue();
    let temp: Monetary;
    const products = data.products;

    for (let usi of Object.keys(products)) {
      temp = new Monetary(products[usi].price);
      temp.multiply(products[usi].quantity);
      result.add(temp);
    }

    // Invert value
    result.multiply(-1);

    return result.data;
  }

  /**
   * Extracts prices from data
   *
   * @param data whose products object to be separated
   * @returns the prices object
   */
  public getPrices(data: basicOrder) {
    let prices: Generic<{
        price: MonetaryType, cost: MonetaryType
    }> = {};
    const products = data.products;

    for (let usi of Object.keys(products)) {
      prices[usi] = {
        price: products[usi].price,
        cost: products[usi].cost
      };
    }

    return prices;
  }

  /**
   * Extracts quantities from data
   *
   * @param data whose products object to be separated
   * @returns the quantities object
   */
  public getQuantities(data: basicOrder): QuantityType {
    let result: QuantityType = {};
    const products = data.products;

    for (let usi of Object.keys(products)) {
      result[usi] = products[usi].quantity;
    }

    return result;
  }

  /**
   * @param data raw basic data of the order
   * @returns a note for the restocking based on the data
   */
  public generateNote(data: basicOrder): string {
    return `customer: ${data.customer_id};
      ${data.courier_id ? `courier: ${data.courier_id};` : ''}
      ${data.link_id ? `parent_order: ${data.link_id};` : ''}`;
  }

  /**
   * @param data basic order data
   * @returns order data suitable for upload
   * @protected
   */
  protected fillDataGaps(data: basicOrder): order {
    return super.fixDataGaps({
      id: data.id,
      note: data.note,
      discount: data.discount,
      status: data.status,
      total: this.generateTotal(data),
      zone: data.zone,
      province: data.province,
      address: data.address,
      delivery: data.delivery,
      courier_id: data.courier_id,
      customer_id: data.customer_id,
      restock_id: data.restock_id, // Added to data by create function
      prices: this.getPrices(data),
      payment: undefined,
      commission_percent: this.currentEmployee?.commission_percent,
      phone_number: data.phone_number,
      email: data.email,
      link_id: data.link_id,
      trail: this.generateInitialTrail()
    });
  }

  /**
   * @param data to be fixed
   * @returns data suitable for the search engine insertion schema
   * @protected
   */
  protected fixSearchEngineData(data: order): Generic {
    return {
      id: data.id,
      date: BaseModel.initialTimestamp(data[SpecialFields.trail]),
      note: data.note,
      zone: data.zone,
      discounted: data.discount === undefined,
      status: data.status,
      total: data.total,
      province: data.province,
      address: data.address ?? "",
      courier_id: data.courier_id ?? "",
      customer_id: data.customer_id,
      commission_percent: data.commission_percent ?? 0,
      phone_number: data.phone_number ?? "",
      email: data.email ?? "",
      link_id: data.link_id ?? ""
    };
  }
}
