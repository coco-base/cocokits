import { DesignTokenBorder } from '../token.model';

/**
 * Generates a CSS value string for a given border design token.
 * It processes the token to construct the corresponding CSS value string
 * including border width, style, and color.
 *
 * @param token - A design token representing a border.
 * @returns A CSS value string for the border.
 */
export function borderCss(token: DesignTokenBorder): string {
  if (typeof token.value.style !== 'string') {
    throw new Error('Only string stroke styles are supported for border tokens');
  }

  return `${token.value.width} ${token.value.style} ${token.value.color}`;
}
