import { Category, Product } from "../index";

/**
 * @param category to get the empty quantities for
 * @returns an empty quantities Object for the category.
 */
export function emptyQuantities(category: Category) {
  return Product.emptyQuantities(category);
}

/**
 * Formats the USP from p_q to toTitle(p) / toTitle(q).
 * @param usp to be formatted
 * @returns the formatted USP
 */
export function formatUsp(usp: string) {
  return Product.invertUsp(usp).join(" / ");
}

/**
 * @param usp to count the options for
 * @returns the options constituting the usp
 */
export function countOptions(usp: string) {
  return Product.invertUsp(usp).length;
}
