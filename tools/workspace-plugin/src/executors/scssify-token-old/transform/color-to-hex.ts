import { parseToRgba, rgba, toHex } from 'color2k';

import { DesignTokenColor } from '../token.model';

/**
 * Converts a design token for color to its corresponding hex value.
 * It processes the token to determine whether it is a string or an object
 * with RGB and alpha values, and returns the corresponding hex value string.
 *
 * @param token - A design token representing a color.
 * @returns A hex value string for the color.
 */
export function colorToHex(token: DesignTokenColor): string {
  if (typeof token.value === 'string') {
    return toHex(token.value);
  }

  const [r, g, b] = parseToRgba(token.value.value);
  const alphaColor = rgba(r, g, b, token.value.alpha);
  return toHex(alphaColor);
}
