/**
 * @param color to add the alpha value to in the form of rgb(nn, nn, nn)
 * @param alphaVal the alpha value
 * @returns the color with the alpha value added
 */
export function addAlpha(color: string, alphaVal: number): string {
  const copy = color.substring(4, color.length - 1);
  return `rgba(${copy}, ${alphaVal})`;
}
