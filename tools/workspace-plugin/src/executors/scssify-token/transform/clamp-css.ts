import { DesignTokenClamp } from '../token.model';

/**
 * Generates a CSS clamp function string for a given clamp design token.
 * It processes the token to construct the corresponding CSS value string
 * including min, ideal, and max values.
 *
 * @param token - A design token representing a clamp.
 * @returns A CSS clamp function string for the clamp.
 */
export function clampCss(token: DesignTokenClamp): string {
  return `clamp(${token.value.min}, ${token.value.ideal}, ${token.value.max})`;
}
