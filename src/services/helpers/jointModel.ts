import { Category, Product, toTitle } from "../index";

/**
 * @param category to get the empty quantities for
 * @returns an empty quantities Object for the category.
 */
export function emptyQuantities(category: Category) {
  return Product.emptyQuantities(category);
}

export function formatUsp(usp: string) {
  return Product.invertUsp(usp).map(v => toTitle(v)).join(" / ");
}
