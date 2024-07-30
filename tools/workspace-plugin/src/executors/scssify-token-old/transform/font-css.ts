import { DesignTokenTypography } from '../token.model';

/**
 * Generates a CSS value string for a given typography design token.
 * It processes the token to construct the corresponding CSS value string
 * including font style, weight, size, line height, and family.
 *
 * @param token - A design token representing typography.
 * @returns A CSS value string for the typography.
 */
export function fontCss(token: DesignTokenTypography): string {
  const fontStyle = token.value.fontStyle ?? '';
  const fontWeight = token.value.fontWeight;
  const fontSize = token.value.fontSize;
  const lineHeight = `/ ${token.value.lineHeight}`;
  const fontFamily = token.value.fontFamily;

  return `${fontStyle} ${fontWeight} ${fontSize} ${lineHeight} ${fontFamily}`.trim();
}
