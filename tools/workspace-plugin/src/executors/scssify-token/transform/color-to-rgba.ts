import { parseToRgba, rgba, toRgba } from 'color2k';

import { DesignTokenColor } from '../token.model';

/**
 * Converts a design token for color to its corresponding RGBA value.
 * It processes the token to determine whether it is a string or an object
 * with RGB and alpha values, and returns the corresponding RGBA value string.
 *
 * @param token - A design token representing a color.
 * @returns An RGBA value string for the color.
 */
export function colorToRgba(token: DesignTokenColor): string {
  if (typeof token.value === 'string') {
    return toRgba(token.value);
  }

  const [r, g, b] = parseToRgba(token.value.value);
  return rgba(r, g, b, token.value.alpha);
}
