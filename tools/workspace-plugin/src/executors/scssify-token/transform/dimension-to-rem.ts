import { hasUnit } from './utils';
import { Logger } from '../../../utils/logger';
import { DesignTokenDimension } from '../token.model';

/**
 * Converts a design token for dimension to its corresponding rem value.
 * It processes the token to determine whether it uses 'rem' or 'px' units
 * and returns the corresponding rem value string.
 * If the unit is unsupported, it logs a warning and returns the value in rem.
 *
 * @param token - A design token representing a dimension.
 * @returns A rem value string for the dimension.
 */
export function dimensionToRem(token: DesignTokenDimension): string {
  const baseFont = 16;
  const floatVal = parseFloat(token.value);

  if (isNaN(floatVal)) {
    throw `Invalid Number: '${token.namePath}: ${token.value}' is not a valid number, cannot transform to rem \n`;
  }

  if (floatVal === 0) {
    return '0';
  }
  if (hasUnit(token.value, 'rem')) {
    return `${floatVal}rem`;
  }

  if (hasUnit(token.value, 'px')) {
    return `${floatVal / baseFont}rem`;
  }

  Logger.warning(`Unsupported unit: ${JSON.stringify(token)}. Use default format: ${floatVal}rem`);
  return `${floatVal}rem`;
}
