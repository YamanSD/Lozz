/**
 * @param value to be formatted
 * @param removeDecimal if true, remove the decimal points
 * @returns formatted string, with commas and to the 3rd decimal
 */
export function formatMonetary(value: number,
                               removeDecimal?: boolean): string {
  if (removeDecimal) {
    value = Math.round(value);
  } else {
    value = Number(value.toFixed(2));
  }

  return new Intl.NumberFormat().format(value);
}
