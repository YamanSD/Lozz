/**
 * Describes the trail object type.
 *
 * - timestamp: number representing the date of the action.
 *   Consists the date string concatenated to the nanosecond, &
 *   two random digits (yyyymmddssnnndd).
 *   Auto-generated on addition.
 *
 * - employee_id: string representing the id of the employee that made
 *   the action.
 *   Auto-detected on addition.
 *
 * - nature: string representing the nature of the action.
 *   Can be any of (CRUDE):
 *   >- C: Employee created the object, first in any trail, only 1.
 *   >- R: Employee reactivated the object, multiple can exist.
 *   >- U: Employee updated the object, multiple can exist.
 *   >- D: Employee deactivated the object, multiple can exist.
 *        Auto-generated on addition.
 *   >- E: Employee erased the object data, last in a trail, only 1.
 *         Cannot be undone, and all data except trail associated
 *         with object are completely erased.
 */
export type TrailType = {
    [timestamp: number]: {
      employee_id: string,
      nature: string
    }
};

/**
 * Describes a monetary value (payment, order value, etc...).
 * First value is the USD portion of the value,
 * Second value is the LBP portion of the value.
 * Both can be floats and can be negative.
 */
export type MonetaryType = [number, number];

/**
 * Used to tag wholesale products in a restocking.
 * Used iff the restocking is linked with an order.
 */
export const WHOLESALE_TAG = "_WHOLE";

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
 *   >- delivered:
 *      These orders have been delivered to the customer successfully and a payment is received.
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
 *
 * Used to map Codes to their meaning, in the Order class.
 */
export enum OrderStatus {
  pending = 0,
  confirmed,
  packaged,
  sent_to_courier,
  delivered,
  canceled,
  canceled_at_courier,
  received_from_courier
}

/**
 * Values can be:
 * - unrelated:
 *     >- These employees do not have any privileges, as they do physical
 *        activities unrelated to sales, such as (cleaning, packaging, etc...).
 *     >- Do not have commission
 * - regular:
 *    >- able to read:
 *    >>- product information, except vendor, costs, and wholesale;
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
  unrelated = 0,
  regular,
  manager,
  admin,
  owner,
}

/**
 * - id: string representing the ID of the vendor.
 *   Auto-generated by firebase.
 *
 * - name: string representing the name of the vendor.
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
 * - trail: Auto-generated and auto-modified on actions.
 */
export type vendor = {
  id: string,
  name: string,
  phone_numbers?: [string, ...string[]],
  emails?: [string, ...string[]],
  trail: TrailType
};

/**
 * - id: string representing the ID of the category.
 *   Auto-generated by firebase.
 *
 * - name: string representing the name of the category.
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
 * - trail: Auto-generated and auto-modified on actions.
 */
export type category = {
  id: string,
  name: string,
  option_keys?: [string, ...string[]],
  options_sets?: {
    [option_key: string]: [any, ...any[]]
  },
  added_price?: {
    [usp: string]: MonetaryType
  },
  trail: TrailType
};

/**
 * - id: string representing the ID of the expense.
 *   Auto-generated using the current datetime
 *   & two random digits (yyyymmddssnnndd).
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
 * - trail: Auto-generated and auto-modified on actions.
 */
export type expense = {
  id: string,
  description: string,
  value: MonetaryType,
  date: Date,
  vendor_id?: string,
  employee_id?: string,
  courier_id?: string,
  trail: TrailType
};

/**
 * - id: string representing the ID of the courier.
 *   Auto-generated by firebase.
 *
 * - name: string representing the name of the courier.
 *   Given by user.
 *
 * - shipping_fees: object mapping province names to shipping values.
 *   Given be user.
 *
 * - orders: list of strings, each representing an order ID.
 *   These orders are at the courier (physically or virtually).
 *   Auto-modified when an order is modified.
 *
 * - trail: Auto-generated and auto-modified on actions.
 */
export type courier = {
  id: string,
  name: string,
  shipping_fees: {
    [province: string]: MonetaryType
  },
  orders: [...string[]],
  trail: TrailType
};

/**
 * - id: string representing the ID of the restocking operation.
 *   Auto-generated using the current datetime and
 *   two random digits (yyyymmddssnnndd).
 *   Represents the creation date of the restocking.
 *
 * - note?: string representing a note regarding the restocking
 *   operation.
 *   Given by user.
 *
 * - to_inventory: boolean representing whether the restocking operation
 *   is to the inventory or the on-display quantities.
 *   Given by user.
 *
 * - quantities: object mapping USIs to quantities of these products in
 *   the restocking operation.
 *   Can be negative to indicate removing and can use floats for
 *   generality.
 *   Either all quantities are positive or all are negative.
 *   Zeroes must be automatically removed before upload.
 *   Wholesale values of a product are tagged at the end with
 *   `_{WHOLESALE_TAG}`.
 *   Given by user.
 *
 * - employee_id: string representing the ID of the employee that made
 *   the restocking operation directly or indirectly (i.e. by an order).
 *   Auto-detected on creation.
 *
 * - item_count: number representing the sum of the quantities of
 *   all items.
 *   Auto-generated on creation.
 */
export type restock = {
  id: string,
  note?: string,
  to_inventory: boolean,
  quantities: {
    [usi: string]: number
  },
  item_count: number,
  employee_id: string,
};

/**
 * - id: string representing the ID of the employee.
 *   Auto-generated using the current datetime and
 *   two random digits (yyyymmddssnnndd).
 *   Represents the join-date of the employee.
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
 * - orders?: list of strings, each representing an ID of an order
 *   that was created by the user.
 *   This list is cleared whenever the employee is paid.
 *   Auto-modified on order creation and upon payment.
 *
 * - end_date?: Date representing when the user left the company,
 *   or was fired.
 *   Auto-generated.
 *
 * - trail: Auto-generated and auto-modified on actions.
 */
export type employee = {
  id: string,
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
  orders?: [...string[]],
  end_date?: Date,
  trail: TrailType
};

/**
 * - id: string representing the ID of the customer.
 *   Auto-generated using the current datetime and
 *   three random digits (yyyymmddssnnnddd).
 *   Represents the join-date of the customer.
 *
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
 * - phone_number?: string, phone number of the customer.
 *   Given be user.
 *
 * - email?: string, email of the customer.
 *   Given be user.
 *
 * - orders: list of strings, each representing the ID of an
 *   order for the customer.
 *
 * - trail: Auto-generated and auto-modified on actions.
 */
export type customer = {
  id: string,
  first_name: string,
  middle_name?: string,
  last_name: string,
  birthday?: Date,
  gender?: boolean,
  is_banned: boolean,
  phone_number?: string,
  email?: string,
  orders: [...string[]],
  trail: TrailType
};

/**
 * - id: string representing the ID of the product.
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
 * - images?: list of strings, each representing the url of a product image.
 *   Number of images and definition varies, based on user tier.
 *   Given by user.
 *
 * - quantities: object mapping USPs to the quantity of the product
 *   available for sale and falling under that USP.
 *   Given by user.
 *   Modified automatically on orders and restocking operations.
 *
 * - wholesale_price?: MonetaryValue representing the base wholesale
 *   price of the product.
 *   Given by user.
 *
 * - added_wholesale_price?: object mapping USPs to added prices on
 *   products falling under the USP.
 *   Given by user.
 *
 * - minimum_wholesale_quantity?: object mapping USPs to quantities.
 *   All these quantities must be fulfilled for a successful wholesale
 *   operation.
 *   Given by user.
 *
 * - wholesale_increment?: number of units of increase for the wholesale
 *   quantity.
 *   For example, if the increment is 12, the employees can only sell
 *   wholesale products in multiples of 12 (12, 24, 36, ...) for all USPs
 *   in the minimum_wholesale_quantity.
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
 * - instructions?: string representing instructions provided for the
 *   product, such as use instructions, washing instructions, etc...
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
 *   This discount applies for the price of a product, not the wholesale
 *   price or the cost.
 *   Given by user.
 *
 * - wholesale_discount?: object mapping USPs to added discount on the
 *   wholesale price of products falling under the USP.
 *   Given by user.
 *
 * - description?: string representing the description of the product.
 *   Given by user.
 *
 * - trail: Auto-generated and auto-modified on actions.
 */
export type product = {
  id: string,
  name: string,
  vendor_id: string,
  category_id: string,
  images?: [...string[]],
  quantities: {
    [usp: string]: number
  },
  wholesale_price?: MonetaryType,
  wholesale_increment?: number,
  added_wholesale_price?: {
    [usp: string]: MonetaryType
  },
  minimum_wholesale_quantity?: {
    [usp: string]: number
  },
  price: MonetaryType,
  added_price?: {
    [usp: string]: MonetaryType
  },
  inventory_quantities: {
    [usp: string]: number
  },
  instructions?: string,
  cost: MonetaryType,
  added_costs?: {
    [usp: string]: MonetaryType
  },
  discount?: {
    [usp: string]: MonetaryType
  },
  wholesale_discount?: {
    [usp: string]: MonetaryType
  },
  description?: string,
  trail: TrailType
};

/**
 * - id: string representing the ID of the order.
 *   Auto-generated using the current datetime and
 *   four random digits (yyyymmddssnnndddd).
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
 * - total?: MonetaryType value of the total price of all products
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
 * - restock_id: string representing the ID of the linked restocking
 *   to the order.
 *   Auto-generated.
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
 * - trail: Auto-generated and auto-modified on actions.
 */
export type order = {
  id: string,
  note?: string,
  discount?: MonetaryType,
  status: OrderStatus,
  total?: MonetaryType,
  province?: string,
  address?: string,
  delivery?: MonetaryType,
  courier_id?: string,
  customer_id: string,
  restock_id: string,
  payment?: MonetaryType,
  commission_percent?: number,
  phone_number?: string,
  email?: string,
  trail: TrailType
};

/**
 * - timestamp: number representing the last modification on the restocking.
 *   (yyyymmddssnnn).
 *
 * - order_id?: string representing the ID of the order related to the
 *   restocking operation.
 *   When present, allows the restocking instance to be deleted.
 *   Auto-added when an order is created.
 */
export type restockProperties = {
  [restock_id: string]: {
    timestamp: number,
    order_id?: string
  }
};

/**
 * - category_id: contains a timestamp (yyyymmddssnnn) for the
 *   category and product IDs mapped to their own timestamps.
 */
export type productProperties = {
  [category_id: string]: {
    [product_id: string]: {
      timestamp: number
    }
  } & {
    timestamp: number,
  }
};

/**
 * - employee_id: contains a timestamp (yyyymmddssnnn) for the employee,
 *   & a tag to indicate whether an employee is online or offline.
 */
export type employeeProperties = {
  [employee_id: string]: {
    timestamp: number,
    is_online: boolean
  }
};

/**
 * - courier_id: contains a timestamp (yyyymmddssnnn) for the courier.
 */
export type courierProperties = {
  [courier_id: string]: {
    timestamp: number
  }
}

/**
 * - vendor_id: contains a timestamp (yyyymmddssnnn) for the vendor.
 */
export type vendorProperties = {
  [vendor_id: string]: {
    timestamp: number
  }
}

/**
 * - customer_id: contains a timestamp (yyyymmddssnnn) for the customer.
 */
export type customerProperties = {
  [customer_id: string]: {
    timestamp: number
  }
}

/**
 * - expense_id: contains a timestamp (yyyymmddssnnn) for the expense.
 */
export type expenseProperties = {
  [expense_id: string]: {
    timestamp: number
  }
}

/**
 * - order_id: contains a timestamp (yyyymmddssnnn) for the order.
 */
export type orderProperties = {
  [order_id: string]: {
    timestamp: number
  }
}

/**
 * - provinces: contains a list of available provinces & a trail
 *   of updates.
 *
 * - rate: contains exchange rate for buying and selling USD, & a trail
 *   of updates.
 */
export type informationProperties = {
  provinces: {
    names: [string, ...string[]],
    trail: TrailType
  },
  rate: {
    buyUsdRate: number,
    sellUsdRate: number,
    roundToNearestLbp: number,
    roundToNearestUsd: number,
    trail: TrailType
  }
}
