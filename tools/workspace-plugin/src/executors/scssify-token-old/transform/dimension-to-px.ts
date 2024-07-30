import { hasUnit } from './utils';
import { Logger } from '../../../utils/logger';
import { DesignTokenDimension } from '../token.model';

/**
 * Converts a design token for dimension to its corresponding pixel value.
 * It processes the token to determine whether it uses 'rem' or 'px' units
 * and returns the corresponding pixel value string.
 * If the unit is unsupported, it logs a warning and returns the value in pixels.
 *
 * @param token - A design token representing a dimension.
 * @returns A pixel value string for the dimension.
 */
export function dimensionToPixel(token: DesignTokenDimension): string {
  const baseFont = 16;
  const floatVal = parseFloat(token.value);

  if (isNaN(floatVal)) {
    throw new Error(
      `Invalid dimension token: '${token.namePath}: ${token.value}' is not valid and cannot be transform to 'float' \n`
    );
  }

  if (floatVal === 0) {
    return '0';
  }

  if (hasUnit(token.value, 'rem')) {
    return `${floatVal * baseFont}px`;
  }

  if (hasUnit(token.value, 'px')) {
    return `${floatVal}px`;
  }

  Logger.warning(`Unsupported unit: ${JSON.stringify(token)}. Use default format: ${floatVal}px`);

  return `${floatVal}px`;
}
