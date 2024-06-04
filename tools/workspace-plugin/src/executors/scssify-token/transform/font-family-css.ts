import { DesignTokenFontFamily } from '../token.model';

/**
 * Generates a CSS value string for a given font-family design token.
 * It processes the token to ensure font names containing spaces are wrapped in quotes.
 *
 * @param token - A design token representing a font-family.
 * @returns A CSS value string for the font-family.
 */
export function fontFamilyCss(token: DesignTokenFontFamily): string {
  return token.value.map((string) => (hasSpaceInName(string) ? `'${string}'` : string)).join(', ');
}

const hasSpaceInName = (string: string) => /\s/g.test(string);
