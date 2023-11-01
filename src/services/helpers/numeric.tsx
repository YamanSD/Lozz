import { MonetaryType } from "../model/types";

/**
 * @param value to be formatted
 * @param removeDecimal if true, remove the decimal points
 * @returns formatted string, with commas and to the 3rd decimal
 */
export function formattedNumber(value: number,
                                removeDecimal?: boolean): string {
  if (removeDecimal) {
    return new Intl.NumberFormat().format(Math.round(value));
  } else {
    const result = new Intl.NumberFormat().format(value);
    const dotIndex = result.indexOf(".");
    const n = result.length;
    const diff = n - dotIndex;

    return dotIndex === -1
      ? `${result}.00` // No Dot
      : (
        diff === 3 // Dot in right position
          ? result
          : (
            diff < 3
              ? `${result}${"0".repeat(3 - diff)}` // missing right zero(s)
              : result.substring(0, dotIndex + 3) // has overflow of decimals
          )
      );
  }
}


/**
 * @param value to be formatted.
 * @returns a formatted value string
 */
export const formatPrice = (value: MonetaryType): string => {
  return `$${formattedNumber(value)}`;
};

/**
 * @param value formatted by formatPrice.
 * @returns the actual value.
 */
export const unpackPrice = (value: string) => {
  /* remove the $ sign */
  let pureValue = value.substring(1);

  if (pureValue.length === 0) {
    return 0;
  }

  /* remove commas from formatting */
  pureValue = pureValue.replaceAll(",", "");
  const actualValue = Number(pureValue);

  /* check if parsing was not successful */
  if (isNaN(actualValue)) {
    return undefined;
  }

  return Number(actualValue.toFixed(2));
};
