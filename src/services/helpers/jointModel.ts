import { Category, Product } from "../index";

/**
 * @param category to get the empty quantities for
 * @returns an empty quantities Object for the category.
 */
export function emptyQuantities(category: Category) {
  return Product.emptyQuantities(category);
}
