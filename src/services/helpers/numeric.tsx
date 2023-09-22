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
    const dotIndex = result.indexOf('.');
    const n = result.length;
    const diff = n - dotIndex;

    return dotIndex === -1
      ? `${result}.00` // No Dot
      : (
        diff === 3 // Dot in right position
          ? result
          : (
            diff < 3
              ? `${result}${'0'.repeat(3 - diff)}` // missing right zero(s)
              : result.substring(0, dotIndex + 3) // has overflow of decimals
          )
      );
  }
}
