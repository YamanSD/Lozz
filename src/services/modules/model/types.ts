/**
 * File contains the core type definitions of the application
 */

// @ts-ignore
import { Schema } from "@orama/orama";

/**
 * Enum class for the nature type of Trails.
 * Can be any of (CRUDE):
 *   >- C: Employee created the object, first in any trail, only 1.
 *   >- R: Employee reactivated the object, multiple can exist.
 *   >- U: Employee updated the object, multiple can exist.
 *   >- D: Employee deactivated the object, multiple can exist.
 *        Auto-generated on addition.
 *   >- E: Employee erased the object data, last in a trail, only 1.
 *         Cannot be undone, and all data except trail associated
 *         with object are completely erased.
 */
export enum TrailNature {
  C = 0,
  R,
  U,
  D,
  E
}

/**
 * Enum for special fields in the data models.
 *
 * - [SpecialFields.trail]: Trail data field to log the actions on a document.
 */
export enum SpecialFields {
  trail = "trail"
}

/**
 * Describes the trail object type.
 *
 * - timestamp: string representing the date of the action.
 *   Consists the date string concatenated to the millisecond (n), &
 *   two random digits (yyyymmddhhMMssnnndd).
 *   Auto-generated on addition.
 *
 * - employee_id: string representing the id of the employee that made
 *   the action.
 *   Auto-detected on addition.
 *
 * - nature: enum representing the nature of the action.
 */
export type TrailType = {
    [timestamp: string]: {
      employee_id: string,
      nature: TrailNature
    }
};

/**
 * Describes a monetary value (payment, order value, etc...).
 *
 * DEPRECATED [
 * First value is the USD portion of the value,
 * Second value is the LBP portion of the value.
 * Both can be floats and can be negative ].
 *
 * Represents the value in USD.
 * Can be a float and/or negative.
 */
export type MonetaryType = number;

/**
 * Values can be:
 *   >- pending:
 *      Pending orders are orders that are still being constructed.
 *      They are stored locally and are not present on the server.
 *   >- confirmed:
 *      Confirmed orders are orders that have been finalized
 *      and are waiting to be packaged.
 *      These orders are sent to the database and are stored locally.
 *      Quantities in these orders effect only the display quantities
 *      of product, not the inventory.
 *   >- packaged:
 *      Packaged orders are orders that were confirmed.
 *      They are considered physically packaged.
 *      These orders are sent to the database and are stored locally.
 *      Quantities in these orders effect only
 *      the inventory quantities of product, not the display.
 *   >- sent_to_courier:
 *      These orders are packaged orders that have been sent to the courier.
 *      These orders are sent to the database and are stored locally.
 *      Quantities in these orders have no effect.
 *      Ids of these orders are stored in courier's order list.
 *   >- paid:
 *      These orders have been delivered to the customer successfully
 *      and a payment is received.
 *      Removed from courier order list.
 *      Accounted for in profit calculation.
 *      Delivery fees if any are added to expenses.
 *   >- canceled:
 *      Order has to be either confirmed or packaged.
 *      Order canceled return its quantities to their appropriate
 *      places on display & in inventory.
 *   >- canceled_at_courier:
 *      Order has to be sent_to_courier.
 *      Order canceled return its quantities
 *      to their appropriate places on display.
 *   >- received_from_courier:
 *      Order has to be cancelled_at_courier.
 *      Order canceled returns its quantities
 *      to their appropriate places in inventory.
 *   >- finalized:
 *      Order has to be paid or canceled at any state.
 *      Quantities not affected.
 *      These orders are immutable in any shape or form.
 *
 * Used to map Codes to their meaning, in the Order class.
 *
 * ## Do not forget to edit the StatisticsBlock.zeroOrderCounts function if you add any new status.
 */
export enum OrderStatus {
  pending = 0,
  confirmed,
  packaged,
  sent_to_courier,
  paid,
  canceled,
  canceled_at_courier,
  received_from_courier,
  finalized
}

/**
 * Values can be:
 * - past:
 *    >- Old employee in the company.
 *    >- Left or was fired, reason is not specified.
 * - unrelated:
 *     >- These employees do not have any privileges, as they do physical
 *        activities unrelated to sales, such as (cleaning, packaging, etc...).
 *     >- Do not have commission
 * - regular:
 *    >- able to read:
 *    >>- product information, except vendor, & costs;
 *    >>- the orders;
 *    >>- the restocks;
 *    >>- customer information;
 *    >>- courier information;
 *    >>- category information;
 *    >>- their own information;
 *    >>- information properties;
 *    >- cannot access deactivated entities.
 *    >- able to create:
 *    >>- new orders;
 *    >- able to update:
 *    >>- their orders;
 *    >>- customer information;
 *    >- unable to delete, deactivate, or reactivate.
 *    >- cannot access profits and expenses, or other reports.
 * - manager:
 *    In addition to `regular` privileges.
 *    >- able to read:
 *    >>- all information;
 *    >- able to create:
 *    >>- new products;
 *    >>- new employees;
 *    >>- new categories;
 *    >>- new vendors;
 *    >>- new couriers;
 *    >- able to update:
 *    >>- all information except owner other managers or admin and owner.
 *    >- can deactivate and reactivate products, but not delete.
 *    >- can see profits, expenses, and other reports.
 * - admin:
 *    In addition to `manager` privileges.
 *    >- can delete any entity except owner or other admin employees.
 *    >- can update all information except admin or owner.
 *    >- cannot create more admins, but managers and lower.
 *    >- cannot change company tier.
 * - owner:
 *    In addition to `admin` privileges.
 *    >- can perform any possible task.
 */
export enum EmployeeRole {
  past = 0,
  unrelated,
  regular,
  manager,
  admin,
  owner,
}

/**
 * - name (Doc ID): string representing the name of the vendor.
 *   Represents the ID of the document
 *   Given by user.
 *
 * - phone_numbers?: list of strings, each representing a
 *   phone number for the vendor.
 *   Given by user.
 *   Can be international.
 *
 * - emails?: list of strings, each representing an
 *   email for the vendor.
 *   Given by user.
 *
 * - [SpecialFields.trail]: Auto-generated and auto-modified on actions.
 */
export type vendor = {
  name: string,
  phone_numbers?: [...string[]],
  emails?: [...string[]],
  [SpecialFields.trail]: TrailType
};

/**
 * Used for the creation of vendors
 */
export type basicVendor = {
  name: string,
  phone_numbers?: [string, ...string[]],
  emails?: [string, ...string[]],
}

/**
 * - name (Doc ID): string representing the name of the category.
 *   Given by user.
 *
 * - option_keys?: list of strings (order matters), each representing
 *   the name of an option for the category.
 *   When not given, the product of the category has not options.
 *
 * - option_values?: each option_key must have a list of values that
 *   represent the set of values for that option.
 *
 * - added_price?: object mapping USPs (check data description)
 *   to a monetary value.
 *   Added to the final price each product under the category and falling
 *   under the USP.
 *
 * - [SpecialFields.trail]: Auto-generated and auto-modified on actions.
 */
export type category = {
  name: string,
  option_keys?: [string, ...string[]],
  option_sets?: {
    [option_key: string]: [any, ...any[]]
  },
  added_price?: {
    [usp: string]: MonetaryType
  },
  [SpecialFields.trail]: TrailType
};

/**
 * Used for the creation of categories
 */
export type basicCategory = {
  name: string,
  option_keys?: [string, ...string[]],
  option_sets?: {
    [option_key: string]: [any, ...any[]]
  },
  added_price?: {
    [usp: string]: MonetaryType
  },
};

/**
 * - id: string representing the ID of the expense.
 *   Auto-generated using the current datetime
 *   & two random digits (yyyymmddhhMMssnnndd).
 *
 * - description: string representing the description of the
 *   expense.
 *
 * - value: value of the expense, must be positive.
 *
 * - date: Date object. Given by user. Accurate to the day.
 *
 * - vendor_id?: string representing the ID of the vendor that
 *   received the payment, iff the payment is for a vendor.
 *   Given by user.
 *
 * - employee_id?: string representing the ID of the employee that
 *   received the payment, iff the payment is for an employee.
 *   Given by user.
 *
 * - courier_id?: string representing the ID of the courier that
 *   received the payment, iff the payment is for a courier.
 *   Given by user.
 *
 * - restock_id?: string representing the ID of the restocking that
 *   is associated with the expense, iff the payment is for an invoice.
 *   Given by user.
 *
 * - [SpecialFields.trail]: Auto-generated and auto-modified on actions.
 */
export type expense = {
  id: string,
  description: string,
  value: MonetaryType,
  date: Date,
  vendor_id?: string,
  employee_id?: string,
  courier_id?: string,
  restock_id?: string,
  [SpecialFields.trail]: TrailType
};

/**
 * Used for the creation of expenses
 * Value is undefined for the case of the restock_data
 */
export type basicExpense = {
  description: string,
  value?: MonetaryType,
  date: Date,
  vendor_id?: string,
  employee_id?: string,
  courier_id?: string,
  restock_data?: basicRestock
};

/**
 * - name (Doc ID): string representing the name of the courier.
 *   Given by user.
 *
 * - shipping_fees: object mapping zone names to shipping values.
 *   Given be user.
 *
 * - [SpecialFields.trail]: Auto-generated and auto-modified on actions.
 */
export type courier = {
  name: string,
  shipping_fees: {
    [zone: string]: MonetaryType
  },
  [SpecialFields.trail]: TrailType
};

/**
 * Used for the creation of couriers
 */
export type basicCourier = {
  name: string,
  shipping_fees: {
    [zone: string]: MonetaryType
  }
};

/**
 * - id (Doc ID): string representing the ID of the restocking operation.
 *   Auto-generated using the current datetime and
 *   two random digits (yyyymmddhhMMssnnndd).
 *   Represents the creation date of the restocking.
 *
 * - note?: string representing a note regarding the restocking
 *   operation.
 *   Given by user.
 *
 * - costs?: object mapping USIs to their cost.
 *   This is used when a restocking is linked to an expense.
 *   Given by user.
 *
 * - quantities: object mapping USIs to quantities of these products in
 *   the restocking operation.
 *   Can be negative to indicate removing and can use floats for
 *   generality.
 *   Either all quantities are positive or all are negative.
 *   Zeroes must be automatically removed before upload.
 *   Given by user.
 *
 * - rusi: stands for restock underscore-separated identifier consists of
 *   a USI & an optional flag to determine whether the USI quantity
 *   is for the inventory or not.
 *   Given by user, the flag specification is generated according to user
 *   choices.
 *
 * - item_count: number representing the sum of the quantities of
 *   all items.
 *   Auto-generated on creation.
 *
 * - [SpecialFields.trail]: Auto-generated and auto-modified on actions.
 */
export type restock = {
  id: string,
  note?: string,
  costs?: {
    [usi: string]: MonetaryType
  }
  quantities: {
    [rusi: string]: number
  },
  item_count: number,
  [SpecialFields.trail]: TrailType
};

/**
 * Used for the creation of restocks
 *
 * - to_inventory?: boolean if true, all quantities are set to inventory.
 *   Otherwise, if false send to display only.
 *   Otherwise, null for both.
 *   Otherwise, undefined modify nothing.
 */
export type basicRestock = {
  id?: string,
  note?: string,
  costs?: {
    [usi: string]: MonetaryType
  },
  to_inventory?: boolean | null,
  quantities: {
    [rusi: string]: number
  },
};

/**
 * Data type for updating the restocking in the transaction
 */
export type restockUpdate = {
  id: string,
  quantities: QuantityType,
  [SpecialFields.trail]: TrailType,
  stamp: TrailNature
};

/**
 * - id (Doc ID): string representing the ID of the employee.
 *   Auto-generated using the initial employee phone number.
 *
 * - first_name: string, legal first name of the employee.
 *   Given by user.
 *
 * - middle_name?: string, legal middle name of the employee.
 *   Given by user.
 *
 * - last_name: string, legal last name of the employee.
 *   Given by user.
 *
 * - phone_number?: string, phone number of the employee.
 *   Given by user.
 *
 * - email?: string, email of the employee (personal or company)
 *   Given by user.
 *
 * - role: enum representing the role of the employee.
 *   Roles are pre-determined.
 *   Given by user.
 *
 * - commission_percent?: number representing the percentage, given
 *   to the employee, of each sale conducted by the employee.
 *   Given by user.
 *
 * - salary: monthly salary value of the employee.
 *   Given by user.
 *
 * - gender?: boolean representing the gender of the employee.
 *   True for male, false for female.
 *   Given by user.
 *
 * - birthday?: date of birth of the employee.
 *   Given by user.
 *
 * - [SpecialFields.trail]: Auto-generated and auto-modified on actions.
 */
export type employee = {
  id: string
  first_name: string,
  middle_name?: string,
  last_name: string,
  phone_number?: string,
  email?: string,
  role: EmployeeRole,
  commission_percent?: number,
  salary: MonetaryType,
  gender?: boolean,
  birthday?: Date,
  join_date: Date,
  [SpecialFields.trail]: TrailType
};

/**
 * Used for the creation of employees
 */
export type basicEmployee = {
  first_name: string,
  middle_name?: string,
  last_name: string,
  phone_number: string,
  email?: string,
  role: EmployeeRole,
  commission_percent?: number,
  salary: MonetaryType,
  gender?: boolean,
  birthday?: Date,
};

/**
 * - first_name: string, first name of the customer.
 *   Given by user.
 *
 * - middle_name?: string, middle name of the customer.
 *   Given by user.
 *
 * - last_name: string, last name of the customer.
 *   Given by user.
 *
 * - birthday?: Date, birthday of the customer.
 *   Given by user.
 *
 * - gender?: boolean true indicates customer is male,
 *   false customer is female.
 *   Given by user.
 *
 * - is_banned: true the user is banned, and employee is warned before
 *   making an order for the customer.
 *   By default, it is false.
 *
 * - phone_number (Doc ID): string, phone number of the customer.
 *   Given be user.
 *
 * - email?: string, email of the customer.
 *   Given be user.
 *
 * - [SpecialFields.trail]: Auto-generated and auto-modified on actions.
 */
export type customer = {
  first_name: string,
  middle_name?: string,
  last_name: string,
  birthday?: Date,
  gender?: boolean,
  is_banned: boolean,
  phone_number: string,
  email?: string,
  [SpecialFields.trail]: TrailType
};

/**
 * Used for the creation of customers
 */
export type basicCustomer = {
  first_name: string,
  middle_name?: string,
  last_name: string,
  birthday?: Date,
  gender?: boolean,
  phone_number: string,
  email?: string,
};

/**
 * Shortcut for typing.
 *
 * - rusp: USP of the product mapped to its number.
 *   A RUSP is a USP with the inventory flag attached to it,
 *   if necessary.
 */
export type QuantityType = {
  [rusp: string]: number
};

/**
 * Shortcut for typing.
 *
 * - Maps an ID to an object mapping RUSPs to quantities
 */
export type JointQuantityType = {
  [id: string]: {
    [rusp: string]: number
  }
}

/**
 *  Generic Object type
 */
export type Generic<T = any> = {
  [key: string]: T
};

/**
 * - id (Doc ID): string representing the ID of the product.
 *   Given by user.
 *
 * - name: string representing the name of the product.
 *   Given by user.
 *
 * - vendor_id: string representing the ID of the vendor of the
 *   order.
 *   Given by user.
 *
 * - category_id: string representing the ID of the category of the
 *   product.
 *   Images given by user, urls generated on upload.
 *
 * - images?: object mapping USPs to their image urls.
 *   Number of images and dimensions varies, based on user tier.
 *   Given by user.
 *
 * - quantities: object mapping USPs to the quantity of the product
 *   available for sale and falling under that USP.
 *   Given by user.
 *   Modified automatically on orders and restocking operations.
 *
 * - increment?: number of units of increase for the quantity.
 *   For example, if the increment is 12, the employees can only sell
 *   products in multiples of 12 (12, 24, 36, ...) for all USPs
 *   in the minimum_quantity.
 *
 * - price: Monetary value representing the sell price of the product.
 *   Given by user.
 *
 * - added_price?: object mapping USPs to added price on products falling
 *   under the USP.
 *   Given by user.
 *
 * - inventory_quantity: object mapping USPs to the quantity of the product
 *   available physically in the inventory and falling under that USP.
 *   Given by user.
 *   Modified automatically on orders and restocking operations.
 *
 * - instructions?: object mapping instruction title
 *   to instructions provided for the
 *   product, such as use instructions,
 *   washing instructions, size tables, etc...
 *   Given by user.
 *
 * - cost: Base cost of the product.
 *   Given by user.
 *
 * - added_costs?: object mapping USPs to added cost on products falling
 *   under the USP.
 *   Given by user.
 *   Values can be negative.
 *
 * - discount?: object mapping USPs to added discount on the
 *   price of products falling under the USP.
 *   This discount applies for the price of a product.
 *   Given by user.
 *
 * - description?: string representing the description of the product.
 *   Given by user.
 *
 * - [SpecialFields.trail]: Auto-generated and auto-modified on actions.
 */
export type product = {
  id: string,
  name: string,
  vendor_id: string,
  category_id: string,
  images?: {
    [usp: string]: [...string[]]
  },
  quantities: QuantityType,
  increment?: number,
  minimum_quantity?: QuantityType,
  price: MonetaryType,
  added_price?: {
    [usp: string]: MonetaryType
  },
  inventory_quantities: QuantityType,
  instructions?: {
    [title: string]: string
  },
  cost: MonetaryType,
  added_costs?: {
    [usp: string]: MonetaryType
  },
  discount?: {
    [usp: string]: MonetaryType
  },
  description?: string,
  [SpecialFields.trail]: TrailType
};

/**
 * Used for the creation of products
 */
export type basicProduct = {
  id: string,
  name: string,
  vendor_id: string,
  category_id: string,
  images?: {
    [usp: string]: [...string[]]
  },
  quantities?: QuantityType,
  increment?: number,
  minimum_quantity?: QuantityType,
  price: MonetaryType,
  added_price?: {
    [usp: string]: MonetaryType
  },
  instructions?: {
    [title: string]: string
  },
  cost: MonetaryType,
  added_costs?: {
    [usp: string]: MonetaryType
  },
  discount?: {
    [usp: string]: MonetaryType
  },
  description?: string,
};

/**
 * - usd: number representing the percentage of discount given for the
 *   USD portion of the MonetaryValue.
 *
 * - lbp: number representing the percentage of discount given for the
 *   LBP portion of the MonetaryValue.
 */
export type MonetaryDiscountType = {
  usd: number,
  // lbp: number
};

/**
 * - usi: string representing the chosen USI of the product.
 *   Generated based on user choices.
 *
 * - name: string representing the name of the product.
 *   Copied from product.
 *
 * - image?: string representing the display image for the product.
 *   Generated based on USI.
 *
 * - quantity: number representing the chosen amount of the product.
 *   Given by user.
 *
 * - total_price: MonetaryValue representing the final price of a unit,
 *   after applying discounts and added price, & multiplying by quantity.
 *
 * - total_discount: MonetaryValue representing the final cost of a unit,
 *   after applying added costs & multiplying by quantity.
 *
 * - discount?: discount percentages given on the product.
 *   Automatically calculated on creation.
 *
 * - description?: string representing the description of the product.
 *   Copied from product.
 *
 * - increment: number representing the increase or decrease in the
 *   quantity on each button press.
 *   Copied from product.
 *
 * - max_quantity?: number representing the maximum possible quantity that
 *   can be added to cart.
 *   Copy of the total number products for the given USI.
 *
 * - min_quantity?: number representing the minimum possible quantity that
 *   can be added to cart.
 *   Copy of the minimum quantity for the USI.
 */
export type cartProduct = {
  usi: string,
  name: string,
  image?: string,
  quantity: number,
  total_price: MonetaryType,
  total_cost: MonetaryType,
  discount?: MonetaryDiscountType,
  description?: string,
  increment: number,
  max_quantity?: number,
  min_quantity?: number
}

/**
 * Used to represent order quantities
 */
export type ItemQuantityType = {
  inv_quantity: number
  quantity: number
  price: MonetaryType,
  cost: MonetaryType
};

/**
 * - id (Doc ID): string representing the ID of the order.
 *   Auto-generated using the current datetime and
 *   four random digits (yyyymmddhhMMssnnndddd).
 *   Represents the creation date of the order.
 *
 * - note?: string representing a note about the order.
 *   Given by user.
 *   Can be auto-modified or auto-generated for specific orders.
 *
 * - discount?: MonetaryValue representing a discount value given on the order.
 *   Given by user.
 *
 * - status: enum representing the status of an order.
 *   Mapping to strings is defined in the Order class.
 *   Automatically modified and added on order modification.
 *
 * - total: MonetaryType value of the total price of all products
 *   in the order.
 *   Does not include discount or delivery fees.
 *   Automatically generated.
 *
 * - delivery?: MonetaryType value of the delivery fees of the order.
 *   Given by courier fees.
 *   Can be modified by user.
 *
 * - courier_id?: string representing the ID of the courier
 *   that is responsible for the order.
 *   Given by user.
 *
 * - customer_id: string representing the ID of the customer that
 *   requested the order.
 *   Given by user.
 *
 * - products: object mapping USIs to their price & cost
 *   at the time of creation of the order.
 *   These values include the discount and other additions.
 *   It also includes the display quantity of the item in the order &
 *   the inventory quantities of the order in the item.
 *   Automatically detected from product list.
 *
 * - item_count: number of items in the order.
 *   This number is auto-generated.
 *
 * - payment?: MonetaryValue representing the amount of money paid
 *   by the customer for the order.
 *   Given by user.
 *
 * - commission_percent?: number representing the commission percentage
 *   given on the order for the employee.
 *   Automatically copied from employee commission percentage,
 *   at the time of creation of the order.
 *
 * - phone_number?: string representing the phone number that is used
 *   to communicate with the customer.
 *   Given by user or auto-detected from customer profile if exists.
 *
 * - email?: string representing the email that is used
 *   to communicate with the customer.
 *   Given by user or auto-detected from customer profile if exists.
 *
 * - province?: number representing the province index in the
 *   CollectionInfo.provinces, of the order.
 *   Given by user.
 *
 * - zone: string representing the zone where the order is located.
 *   Given by user.
 *
 * - link_id?: string representing the ID of a parent order.
 *   Child orders are exchange orders for previous orders.
 *   Autogenerated on exchange order.
 *
 * - [SpecialFields.trail]: Auto-generated and auto-modified on actions.
 */
export type order = {
  id: string,
  note?: string,
  discount?: MonetaryType,
  status: OrderStatus,
  total: MonetaryType,
  zone: string,
  province?: number,
  address?: string,
  delivery?: MonetaryType,
  courier_id?: string,
  customer_id: string,
  item_count: number,
  products: {
    [usi: string]: ItemQuantityType
  },
  payment?: MonetaryType,
  commission_percent?: number,
  phone_number?: string,
  email?: string,
  link_id?: string,
  [SpecialFields.trail]: TrailType
};

/**
 * Used for the creation of orders
 *
 * - is_confirmed: If true indicates that the order is to be created
 *                 as confirmed, otherwise the order is stored locally
 *                 only as pending.
 *
 * - packaged: If true indicates that the order is to be created as packaged,
 *             otherwise the order is stored according to is_confirmed
 */
export type basicOrder = {
  id?: string,
  note?: string,
  status: OrderStatus,
  discount?: MonetaryType,
  zone: string,
  province?: number,
  address?: string,
  delivery?: MonetaryType,
  courier_id?: string,
  customer_id: string,
  restock_id?: string,
  products: {
    [usi: string]: {
      inv_quantity?: number, // Do not include in creation.
      quantity: number,
      price: MonetaryType,
      cost: MonetaryType
    }
  },
  phone_number?: string,
  email?: string,
  link_id?: string
}

/**
 * Enum class for the information types.
 *
 * - zones: Information about the available zones to sell products, also
 *   defines shipping boundaries.
 *
 * - rate: Information about the exchange rate between USD & LBP.
 *         In addition, contains information about rounding currencies.
 */
export enum InformationType {
  provinces = "provinces",
  // rate = "rate",
  zones = "zones"
}

/**
 * - provinces: contains a list of available legal provinces.
 *
 * - rate: contains exchange rate for buying and selling USD, & a trail
 *   of updates.
 */
export type properties = {
  [InformationType.provinces]: string[],
  [InformationType.zones]: {
    data: {
      [name: string]: {
        shipping_discounts?: {
          [usd_lower_bound: number]: MonetaryDiscountType | MonetaryType
        },
        total_discounts?: {
          [usd_lower_bound: number]: MonetaryDiscountType | MonetaryType
        }
      }
    },
    [SpecialFields.trail]: TrailType
  },
  // [InformationType.rate]: {
  //   buyUsdRate: number,
  //   sellUsdRate: number,
  //   roundToNearestLbp: number,
  //   roundToNearestUsd: number,
  //   [SpecialFields.trail]: TrailType
  // }
}

/**
 * Basic properties used for the creation of properties
 */
export type basicProperties = {
  [InformationType.provinces]?: undefined, // Ignore
  [InformationType.zones]: {
    data: {
      [name: string]: {
        shipping_discounts?: {
          [usd_lower_bound: number]: MonetaryDiscountType | MonetaryType
        },
        total_discounts?: {
          [usd_lower_bound: number]: MonetaryDiscountType | MonetaryType
        }
      }
    },
  },
  // [InformationType.rate]: {
  //   buyUsdRate: number,
  //   sellUsdRate: number,
  //   roundToNearestLbp: number,
  //   roundToNearestUsd: number,
  // }
}

/**
 * provinces information type
 */
export type provinceInformation = properties[InformationType.provinces];

// /**
//  * Rate information type
//  */
// export type rateInformation = properties[InformationType.rate];

/**
 * Zone information type
 */
export type zoneInformation = properties[InformationType.zones];

/**
 * General type for the information fragments.
 *
 * - type: current values,
 * >- provinces
 * >- rate
 * - data: data of the fragment.
 */
export type information = {
  type: InformationType,
  // data: provinceInformation | rateInformation | zoneInformation
  data: provinceInformation | zoneInformation
}

/**
 * Defines the search schema for the Vendor collection
 */
export const VendorSearchSchema: Schema = {
  id: 'string', // Required for search engine
  name: 'string',
  phone_numbers: 'string[]',
  emails: 'string[]'
};

/**
 * Defines the search schema for the Category collection
 */
export const CategorySearchSchema: Schema = {
  id: 'string', // Required for search engine
  name: 'string',
  option_keys: 'string[]'
};

/**
 * Defines the search schema for the Expense collection
 */
export const ExpenseSearchSchema: Schema = {
  id: 'string', // Required for search engine
  description: 'string',
  value: 'number[]',
  date: 'string',  // (yyyymmdd) format
  vendor_id: 'string', // Can be empty
  employee_id: 'string', // Can be empty
  courier_id: 'string' // Can be empty
};

/**
 * Defines the search schema for the Courier collection
 */
export const CourierSearchSchema: Schema = {
  id: 'string', // Required for search engine
  name: 'string',
  provinces: 'string[]'
};

/**
 * Defines the search schema for the Restocks collection
 */
export const RestockSearchSchema: Schema = {
  id: 'string', // Required for search engine
  date: 'string', // restock ID
  note: 'string', // Can be empty
  item_count: 'number',
  invoice_linked: 'boolean',
  employee_id: 'string',
  quantities: 'string[]' // Only USIs
};

/**
 * Defines the search schema for the Employee collection
 */
export const EmployeeSearchSchema: Schema = {
  id: 'string', // Required for search engine
  first_name: 'string',
  middle_name: 'string', // Can be empty
  last_name: 'string',
  phone_number: 'string', // Can be empty
  email: 'string', // Can be empty
  role: 'number',
  commission_percent: 'number', // Can be empty
  salary: 'number[]',
  gender: 'boolean', // Can be empty
  birthday: 'string', // Can be empty, (yyyymmdd)
  left: 'boolean',
  join_date: 'string' // (yyyymmdd), same as ID
};

/**
 * Defines the search schema for the Customer collection
 */
export const CustomerSearchSchema: Schema = {
  id: 'string', // Required for search engine
  first_name: 'string',
  middle_name: 'string', // Can be empty
  last_name: 'string',
  phone_number: 'string', // Can be empty
  email: 'string', // Can be empty
  gender: 'boolean', // Can be empty
  birthday: 'string', // Can be empty, (yyyymmdd)
  is_banned: 'boolean'
};

/**
 * Defines the search schema for the Product collection
 */
export const ProductSearchSchema: Schema = {
  id: 'string', // Required for search engine
  name: 'string',
  vendor_id: 'string',
  category_id: 'string',
  price: 'number[]',
  cost: 'number[]',
  discounted: 'boolean',
  description: 'string',
  available_values: 'string[]'
};

/**
 * Defines the search schema for the Order collection
 */
export const OrderSearchSchema: Schema = {
  id: 'string', // Required for search engine
  date: 'string',
  note: 'string', // Can be empty
  discounted: 'boolean',
  status: 'number',
  total: 'number[]',
  zone: 'string',
  province: 'number', // Can be empty
  address: 'string', // Can be empty
  courier_id: 'string', // Can be empty
  customer_id: 'string',
  commission_percent: 'number', // Can be empty
  phone_number: 'string',
  email: 'string',
  link_id: 'string' // Can be empty
};

/**
 * - timestamp: string representing the ID of the statistic block.
 *   It also represents time period for the block.
 *   In the form of (yyyymmddhh).
 *
 * - sales: MonetaryType value representing the total sales of orders
 *   in the block.
 *   Can be negative.
 *   Generated by orders.
 *
 * - sold_products: number representing the total number of sold
 *   products in the block.
 *   Generated by orders.
 *
 * - sold_quantities: object mapping product IDs to total sold quantity
 *   in the block.
 *   Generated by orders.
 *
 * - order_counts: object mapping OrderStatus to the number of orders
 *   under the said status.
 *   Generated by orders.
 *
 * - profit: MonetaryType representing the net profit in the block.
 *   Minimum is zero.
 *   Generated by orders.
 *
 * - moved_quantities: object mapping product IDs to the quantity change
 *   in a statistic block.
 *   Generated by restocks.
 *
 * - moved_products: number of moved products in a statistic block.
 *   Generated by restocks.
 *
 * - expenses: MonetaryType representing the total expenses paid in
 *   the block.
 *   An expense is in a block, according to its date, not creation date.
 *   Generated by expenses.
 *
 * - shipping_fees: MonetaryType representing the total shipping fee
 *   expenses paid by the company.
 *   Generated by expenses & orders.
 *
 * - employee_payments: MonetaryType representing the total employee
 *   expenses paid by the company.
 *   Generated by expenses.
 *
 * - vendor_payments: MonetaryType representing the total vendor payments.
 *   Generated by expenses.
 *
 * - sales_avg: MonetaryType representing the average total for the orders
 *   Generated by orders.
 */
export type statisticsBlock = {
  timestamp: string,
  sales: MonetaryType,
  sold_products: number,
  actual_sold_products: number,
  restocks: string[],
  orders: string[],
  expenses: string[],
  sold_quantities: {
    [product_id: string]: {
      aggregate: number,
      actual: number
    }
  },
  moved_products: number,
  moved_quantities: {
    [product_id: string]: number
  },
  status_counts: {
    [status in OrderStatus]: {
      actual: number,
      aggregate: number
    }
  },
  profit: MonetaryType,
  total_expenses: MonetaryType,
  shipping_fees: MonetaryType,
  employee_payments: MonetaryType,
  vendor_payments: MonetaryType,
  sales_avg: MonetaryType,
  order_counts: number
};

/**
 * Separated values of a timestamp.
 */
export type dissectedTimestamp = {
  year: string,
  month: string,
  day: string,
  hour: string
};

/**
 *  type alias for order products property
 */
export type orderProducts = order["products"];

/**
 * type alias for order quantity property
 */
export type OrderProductQuantities = {
  [usi: string]: {
    quantity: number,
    inv_quantity: number
  }
};
