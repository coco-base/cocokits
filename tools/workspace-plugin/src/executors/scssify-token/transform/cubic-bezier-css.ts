import { DesignTokenCubicBezier } from '../token.model';

/**
 * Generates a CSS cubic-bezier function string for a given cubic-bezier design token.
 * It processes the token to construct the corresponding CSS value string
 * including x1, y1, x2, and y2 values.
 *
 * @param token - A design token representing a cubic-bezier.
 * @returns A CSS cubic-bezier function string for the cubic-bezier.
 */
export function cubicBezierCss(token: DesignTokenCubicBezier): string {
  return `cubic-bezier(${token.value.x1}, ${token.value.y1}, ${token.value.x2}, ${token.value.y2})`;
}
