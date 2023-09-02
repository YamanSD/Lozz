import BaseController, { ControllerFlag } from "./BaseController";
import {
  basicOrder,
  Generic,
  MonetaryType,
  order,
  OrderProductQuantities,
  orderProducts,
  OrderSearchSchema,
  OrderStatus,
  product,
  SpecialFields,
  TrailNature
} from "../model/types";
import firestore from "@react-native-firebase/firestore";
import CollectionInfo from "../../../CollectionInfo";
import Order from "../model/Order";
import {
  IdDoesNotExistError,
  IllegalStateError,
  InsufficientQuantitiesError,
  InvalidQuantitiesError,
  NoCancelError,
  OrderAlreadyRevokedError,
  OrderNotAtCourierError,
  OrderNotConfirmedNorPendingError,
  OrderNotPendingError,
  ProductNotFoundError
} from "./Errors";
import CourierController from "./CourierController";
import CustomerController from "./CustomerController";
import Monetary from "../local_model/Monetary";
import Employee from "../model/Employee";
import { reduxStorage } from "../../../store";
import ReduxParameters from "../../../ReduxParameters";
import BaseModel from "../model/BaseModel";
import Product from "../model/Product";
import ProductController from "./ProductController";
import CategoryController from "./CategoryController";
import StatisticsBlock from "../local_model/StatisticsBlock";


/**
 * Class responsible for handling operations on the orders' collection.
 */
export default class OrderController extends BaseController<order> {
  private static readonly flag: number =
    ControllerFlag.can_update
    | ControllerFlag.has_trail
    | ControllerFlag.pivot_not_list
    | ControllerFlag.statistical;

  /* flag appended to the beginning of an order ID, if it is pending */
  private static PENDING_FLAG = "pending_";

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

    this.loadSearchData().then(async () => {
      this.activateListener();
      this.injectDependency();
      await this.loadStatistics();
    });
  }

  /**
   * Loads the orders into the statistics iff the operation has not been done
   * @private
   */
  private async loadStatistics(): Promise<void> {
    if (StatisticsBlock.isLoaded(this.collectionName)) {
      return;
    }

    let id = 0;

    // Load non-pending orders
    while (id++ < this.pivot) {
      StatisticsBlock.addOrder(await this.get(id.toString()));
    }

    // Load pending orders
    for (let pendingId of this.pendingIds) {
      StatisticsBlock.addOrder(await this.get(pendingId));
    }

    StatisticsBlock.setLoaded(this.collectionName);
  }

  /**
   * @returns the products controller for the server
   */
  public get productController(): ProductController {
    return BaseController.getDependency(
      CollectionInfo.product.name,
      ProductController,
      this.metaServer
    );
  }

  /**
   * @returns the categories controller for the server
   */
  public get categoryController(): CategoryController {
    return BaseController.getDependency(
      CollectionInfo.category.name,
      CategoryController,
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
      this.storage.set(this.pendingPivotName, pivot);
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
    if (id === this.pendingPivotName) {
      throw new IllegalStateError();
    }

    if (!this.isPending(id) && await this.isIdAvailable(id)) {
      throw new IdDoesNotExistError();
    }

    const orderData = await this.getData(id) as order;

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

    return new Order(orderData, customer, courier, link);
  }

  /**
   * Quantities not in the inventory are added to the inventory.
   * Quantities not on display are added to the on display.
   *
   * @param id of the order whose quantities moved
   *        to both inventory & display.
   * @param stamp to add to the product trail
   * @param status of the order
   * @private
   */
  private async transferToBoth(id: string,
                               stamp: TrailNature,
                               status: OrderStatus) {
    const order = await this.get(id);

    await this.updateProducts(id, order.duplicateProducts, stamp, status);
  }

  /**
   * @param id of the order whose quantities moved
   *        to the inventory only.
   * @param stamp to add to the product trail
   * @param status of the order
   * @private
   */
  private async transferToInventory(id: string,
                                    stamp: TrailNature,
                                    status: OrderStatus) {
    const order = await this.get(id);

    await this.updateProducts(
      id,
      order.convertDestination(true),
      stamp,
      status
    );
  }

  /**
   * @param id of the order whose quantities moved
   *        to the display only.
   * @param stamp to add to the product trail
   * @param status of the order
   * @private
   */
  public async transferFromInventory(id: string,
                                     stamp: TrailNature,
                                     status: OrderStatus) {
    const order = await this.get(id);

    await this.updateProducts(
      id,
      order.convertDestination(false),
      stamp,
      status
    );
  }

  /**
   * @param id of the order operation whose effects revoked completely
   * @param status of the order
   */
  private async revoke(id: string, status: OrderStatus) {
    const order = await this.get(id);

    if (order.isDeactivated) {
      throw new OrderAlreadyRevokedError();
    }

    await this.updateProducts(
      id,
      order.zeroQuantityProducts,
      TrailNature.D,
      status
    );
  }

  /**
   * @param newProducts
   * @param oldProducts
   * @returns the combined quantities object
   * @private
   */
  private static combineProducts(
    newProducts: orderProducts,
    oldProducts?: orderProducts): orderProducts {
    if (oldProducts === undefined) {
      return newProducts;
    }

    let result = BaseModel.deepCopy(newProducts);
    const usiList = BaseController.joinKeys(result, oldProducts);

    for (let usi of usiList) {
      if (!(usi in result)) {
        result[usi] = {
          price: oldProducts[usi].price,
          cost: oldProducts[usi].cost,
          quantity: 0,
          inv_quantity: 0
        };
      }

      result[usi].quantity -= oldProducts[usi]?.quantity ?? 0;
      result[usi].inv_quantity -= oldProducts[usi]?.inv_quantity ?? 0;
    }

    return result;
  }

  /**
   * @param id ID of the order to be updated
   * @param newProducts new products of the order
   * @param stamp to add to the product trail
   * @param status of the order to be updated
   */
  private async updateProducts(
    id: string,
    newProducts: orderProducts,
    stamp: TrailNature,
    status?: OrderStatus) {
    const oldOrder = await this.get(id);

    let products = OrderController.combineProducts(
      newProducts,
      oldOrder.products
    );

    let trail = oldOrder.trail;

    this.stamp(trail, stamp);

    let data = {
      id: oldOrder.id,
      products: newProducts,
      total: this.generateTotal(newProducts),
      item_count: this.getItemCount(newProducts),
      [SpecialFields.trail]: trail
    } as order;

    if (status !== undefined) {
      data.status = status;
    }

    // Also updates order
    await this.performQuantityTransaction(products, data, false);
  }

  /**
   * @param id of the order whose quantities updated
   * @param newProducts new products in the order
   */
  public async updateQuantities(id: string, newProducts: orderProducts) {
    return await this.updateProducts(id, newProducts, TrailNature.U);
  }

  /**
   * @param data basic raw data to create an order
   * @throws InsufficientQuantitiesError if the name of the order is taken
   */
  public async create(data: basicOrder): Promise<string> {
    // Fix quantities
    for (let usi of Object.keys(data.products)) {
      if (data.products[usi].inv_quantity !== undefined) {
        throw new InvalidQuantitiesError();
      }

      data.products[usi].inv_quantity = 0;
    }

    if (data.status === OrderStatus.pending) {
      const id =
        `${OrderController.PENDING_FLAG}${this.pendingPivot(true)}`;

      // Additional data such as total & trail are discarded on creation
      let temp = await this.fillDataGaps(data);
      temp.total = this.generateTotal(data.products as orderProducts);

      // Pending local
      await this.setCache(id, temp);

      return id;
    }

    const dest = Order.isStatusToInventory(data.status);

    if (dest === null) {
      data.products = Order.duplicateProducts(
        data.products as orderProducts
      );
    } else {
      data.products = Order.convertDestination(
        data.products as orderProducts,
        dest
      );
    }

    try {
      return await this.performQuantityTransaction(
        data.products as orderProducts,
        this.fixDataGaps(data),
        true
      );
    } catch (e) {
      if (e instanceof EvalError) {
        throw new InsufficientQuantitiesError();
      } else {
        throw e;
      }
    }
  }

  /**
   * @param id to be checked
   * @returns true if the ID is for a pending order
   * @private
   */
  private isPending(id: string): boolean {
    return id.startsWith(OrderController.PENDING_FLAG);
  }

  /**
   * @returns set of IDs of pending orders
   */
  public get pendingIds(): Set<string> {
    let result = new Set<string>();

    for (let id of this.storage.getAllKeys()) {
      if (this.isPending(id)) {
        result.add(id);
      }
    }

    return result;
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

    const result = await this.create(order.getBasicData(OrderStatus.confirmed));
    this.removeCache(oldId);

    return result;
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
      await this.transferToBoth(id, TrailNature.U, OrderStatus.packaged);
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
   * @param products to be processed
   * @returns an object containing product IDs list sorted in descending order
   *          of their USP quantities & product quantities that map product IDs
   *          to their USP quantities
   * @private
   */
  private static processUsi(products: orderProducts): {
    productQuantities: OrderProductQuantities,
    productUsi: string[]
  } {
    let result: OrderProductQuantities = {};

    // Can use a Max Heap to speed up (untested idea)
    let sums: Generic<number> = {};

    for (let usi of Object.keys(products)) {
      result[usi] = Order.extractQuantities(products[usi]);
      sums[usi] = result[usi].quantity + result[usi].inv_quantity;
    }

    let productUsi = Object.keys(result);

    productUsi.sort((rusi_0, rusi_1) => {
      return sums[rusi_1] - sums[rusi_0];
    });

    return {
      productQuantities: result,
      productUsi: productUsi
    };
  }

  /**
   * Performs product quantities transaction for the order.
   *
   * @param quantities of to be transferred
   * @param order raw order data to perform the transaction for
   * @param create if true, generate an order ID
   * @returns the order ID if the transaction succeeds
   * @throws EvalError if the transaction fails due to quantities
   * @private
   */
  private async performQuantityTransaction(
    quantities: orderProducts,
    order: order,
    create: boolean) {
    return await this.runTransaction(async (transaction) => {
      let products: Product[] = [];
      let references: Generic = {};

      let {
        productQuantities, productUsi
      } = OrderController.processUsi(quantities);

      let newPivot;

      if (create) {
        const idDoc = await this.idSetDocument.get();

        if (idDoc.exists) {
          newPivot = (
            await transaction.get(this.idSetDocument)
          ).data()?.data + 1;
        } else {
          newPivot = this.pivot + 1;
        }
      }

      const productController = this.productController;
      const categoryController = this.categoryController;

      let documentRef, product: Product, data;
      // Default value to suppress error
      let usi: string = "";

      /* Read all products, check quantities for each */
      for (usi of productUsi) {
        const productId = Product.invertUsi(usi).id;
        const usp = Product.usiToUsp(usi);

        documentRef = productController.collection.doc(productId);
        const document = await transaction.get(documentRef);

        if (!document.exists) {
          throw new ProductNotFoundError();
        }

        data = document.data() as Generic as product;
        product = Product.generateWrapper(
          productId,
          data,
          await categoryController.get(data.category_id)
        );

        let quantityValue = productQuantities[usi];

        // Add to display
        product.addSingle(
          quantityValue.quantity,
          usp,
          false
        );

        // Add to inventory
        product.addSingle(
          quantityValue.inv_quantity,
          usp,
          true
        );

        products.push(product);
        references[productId] = documentRef;
      }

      /* Update products */
      for (product of products) {
        await transaction.update(
          references[product.id],
          product.suitableQuantities()
        );
      }

      if (create) {
        await transaction.set(
          this.idSetDocument, {
          data: newPivot
        });

        order.id = newPivot;

        await transaction.set(
          this.collection.doc(newPivot.toString()),
          await this.fillDataGaps(order)
        );

        return newPivot.toString();
      }

      let trail = order[SpecialFields.trail];

      // Do not erase old quantities if the order is going to be
      // Deactivated
      if (trail !== undefined && BaseModel.isDeactivated(trail)) {
        // @ts-ignore
        delete order.products;
      }

      await transaction.update(
        this.collection.doc(order.id),
        this.fixDataGaps(order)
      );

      return order.id;
    });
  }

  /**
   * @param id of the order to be canceled
   */
  public async cancel(id: string) {
    let order = await this.get(id);
    let revoke = false;

    if (order.status === OrderStatus.pending) {
      this.removeCache(id);
      return;
    }

    switch (order.status) {
      case OrderStatus.confirmed:
        order.status = OrderStatus.canceled;
        revoke = true;
        break;
      case OrderStatus.packaged:
        order.status = OrderStatus.canceled;
        revoke = true;
        break;
      case OrderStatus.paid:
      case OrderStatus.sent_to_courier:
        order.status = OrderStatus.canceled_at_courier;
        break;
      default:
        throw new NoCancelError();
    }

    if (revoke) {
      await this.revoke(order.id, order.status);
    } else {
      // Negative quantities thus moving them to inventory,
      // deducts from the inventory but not the display
      await this.transferToInventory(order.id, TrailNature.U, order.status);
    }

    // Deactivate a canceled order
    this.stamp(order.trail, TrailNature.D);
    await this.updateServer(order.data, order.id, true);
  }

  /**
   * @param id of the order to be received from the courier
   */
  public async receive(id: string) {
    let order = await this.get(id);

    if (order.status !== OrderStatus.canceled_at_courier) {
      throw new OrderNotAtCourierError();
    }

    order.status = OrderStatus.received_from_courier;

    // Transfer From inventory of a negative value adds to the inventory
    await this.transferFromInventory(order.id, TrailNature.U, order.status);
  }

  /**
   * @param model new model of the order
   * @throws IdDoesNotExistError if the order does not exist
   */
  public async update(model: Order) {
    if (this.isPending(model.id)) {
      await this.updateCache(model.id, model.data);
      return;
    }

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
   * @param products to generate the total for
   * @returns the total monetary value for the order, not accounting
   *          for discounts or delivery.
   */
  public generateTotal(products: orderProducts): MonetaryType {
    let result = Monetary.noValue();
    let temp: Monetary;

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
   * Extracts item count from data
   *
   * @param products whose quantities counted
   * @returns the item count
   */
  public getItemCount(products: orderProducts): number {
    let result = 0;

    for (let info of Object.values(products)) {
      result += Math.abs(
        info.quantity === 0 ? info.inv_quantity ?? 0 : info.quantity
      );
    }

    return result;
  }

  /**
   * @param data basic order data
   * @returns order data suitable for upload
   * @protected
   */
  protected async fillDataGaps(data: basicOrder): Promise<order> {
    const total = this.generateTotal(data.products as orderProducts);

    return super.fixDataGaps({
      id: data.id,
      note: data.note,
      discount: data.discount,
      status: data.status,
      total: total,
      zone: data.zone,
      province: data.province,
      address: data.address,
      delivery: await this.getShippingFees(total, data),
      courier_id: data.courier_id,
      customer_id: data.customer_id,
      products: data.products,
      item_count: this.getItemCount(data.products as orderProducts),
      payment: undefined,
      commission_percent: this.currentEmployee?.commission_percent,
      phone_number: data.phone_number,
      email: data.email,
      link_id: data.link_id,
      trail: this.generateInitialTrail()
    });
  }

  /**
   * @param total calculated total of the order
   * @param data basic raw data
   * @returns the suitable shipping fees for the raw data
   * @protected
   */
  protected async getShippingFees(total: MonetaryType, data: basicOrder):
    Promise<undefined | MonetaryType> {
    if (data.delivery !== undefined) {
      return data.delivery;
    }

    if (data.courier_id === undefined) {
      return undefined;
    }

    let courier = await this.courierController.get(data.courier_id);

    return courier.getShippingFees(new Monetary(total), data.zone).data;
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

  /**
   * @param id of the order to be inserted to statistics
   * @protected
   */
  protected async insertStatistic(id: string): Promise<void> {
    if (id === this.pendingPivotName) {
      return;
    }

    StatisticsBlock.addOrder(await this.get(id));
  }

  /**
   * @param id of the order to be removed to statistics
   * @protected
   */
  protected async removeStatistic(id: string): Promise<void> {
    if (id === this.pendingPivotName) {
      return;
    }

    StatisticsBlock.subtractOrder(await this.get(id));
  }
}
