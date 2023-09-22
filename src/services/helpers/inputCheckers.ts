/* maximum name length */
import { MonetaryType } from "../model/types";

export const maxNameLength = 26;

/**
 * @param name to check
 * @returns 0 if the name is valid
 */
export const checkName = (name: string) => {
  return (name.length > maxNameLength ? 1 : 0)
    + (name.match(/^([0-9 ]|[a-z ])*?([0-9a-z ]*)$/i) ? 0 : 2);
};

/* maximum ID length */
export const maxIdLength = 6;

/**
 * @param id to check
 * @returns 0 if the name is valid
 */
export const checkId = (id: string) => {
  return (id.length > maxIdLength ? 1 : 0)
    + (id.match(/^([0-9]|[a-z])*?([0-9a-z]*)$/) ? 0 : 2);
};

/* maximum price value */
export const maxPrice = 100_000;

/**
 * @param value to check
 * @returns 0 if the value is valid
 */
export const checkPrice = (value: MonetaryType) => {
  return (value > maxPrice ? 1 : 0) + (value >= 0 ? 0 : 2);
};
