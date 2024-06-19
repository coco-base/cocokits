import { Logger } from '../../../utils/logger';
import { DesignTokenFontWeight } from '../token.model';

/**
 * Converts a design token for font weight to its corresponding numeric value.
 * It processes the token to determine whether it is a numeric value or a string
 * representing a font weight name and returns the corresponding numeric value as a string.
 *
 * @param token - A design token representing a font weight.
 * @returns A numeric value string for the font weight or '400' if the token is unsupported.
 */
export function fontWeightToNumber(token: DesignTokenFontWeight): string {
  const valueAsInt = typeof token.value === 'number' ? token.value : parseInt(token.value);

  if (!isNaN(valueAsInt) && fontWeightsNumbers.includes(valueAsInt)) {
    return `${token.value}`;
  }

  const fromMatrix: false | number | undefined =
    typeof token.value === 'string' && fontWeightsNames[token.value.toLowerCase()];

  if (fromMatrix) {
    return `${fromMatrix}`;
  }

  Logger.warning(`Unsupported font-weight: ${JSON.stringify(token)}. Use default font-weight: 400`);
  return '400';
}

const fontWeightsNumbers = [100, 200, 300, 400, 600, 700, 800, 900, 950];

const fontWeightsNames: { [key: string]: number } = {
  thin: 100,
  hairline: 100,

  'extra light': 200,
  'extra-light': 200,
  'ultra-light': 200,
  extralight: 200,
  ultralight: 200,

  light: 300,

  normal: 400,
  regular: 400,
  book: 400,

  medium: 500,

  'semi bold': 600,
  'semi-bold': 600,
  'demi-bold': 600,
  semibold: 600,
  demibold: 600,

  bold: 700,

  'extra bold': 800,
  'extra-bold': 800,
  'ultra-bold': 800,
  extraBold: 800,
  extrabold: 800,
  ultrabold: 800,

  black: 900,
  heavy: 900,

  'extra black': 950,
  'extra-black': 950,
  'ultra-black': 950,
  extrablack: 950,
  ultrablack: 950,
};
