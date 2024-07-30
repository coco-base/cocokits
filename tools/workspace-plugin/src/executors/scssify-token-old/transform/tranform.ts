import { aliasValue } from './alias';
import { borderCss } from './border-css';
import { clampCss } from './clamp-css';
import { colorToHex } from './color-to-hex';
import { colorToRgba } from './color-to-rgba';
import { cubicBezierCss } from './cubic-bezier-css';
import { dimensionToPixel } from './dimension-to-px';
import { dimensionToRem } from './dimension-to-rem';
import { fontCss } from './font-css';
import { fontFamilyCss } from './font-family-css';
import { fontWeightToNumber } from './font-weight-to-number';
import { gradientCss } from './gradient-css';
import { shadowCss } from './shadow-css';
import { isAliasValue } from './utils';
import { Logger } from '../../../utils/logger';
import { ScssifyTokenExecutorSchema } from '../schema';
import { DesignToken, DesignTokenType } from '../token.model';

const TRANSFORM_FN: Record<DesignTokenType, (options: ScssifyTokenExecutorSchema) => (token: DesignToken) => string> = {
  [DesignTokenType.Border]: () => borderCss,
  [DesignTokenType.Clamp]: () => clampCss,
  [DesignTokenType.Color]: (options) => (options.color === 'hex' ? colorToHex : colorToRgba),
  [DesignTokenType.CubicBezier]: () => cubicBezierCss,
  [DesignTokenType.Dimension]: (options) => (options.dimension === 'pixel' ? dimensionToPixel : dimensionToRem),
  [DesignTokenType.Typography]: () => fontCss,
  [DesignTokenType.FontFamily]: () => fontFamilyCss,
  [DesignTokenType.FontWeight]: () => fontWeightToNumber,
  [DesignTokenType.Gradient]: () => gradientCss,
  [DesignTokenType.Shadow]: () => shadowCss,
};

/**
 * Transforms the value of a design token to standard CSS values.
 * If the token is an alias, the value will be a CSS variable and will fill the dependencies.
 *
 * @param token - The design token to transform.
 * @param options - The schema options for transforming the token.
 * @returns The transformed token value and its dependencies, or null if unsupported.
 *
 * @example
 * Token: { namePath: ['fill', '50'], value: '{colors.gray.50}', type: 'color' };
 * Result: { value: 'colors-gray-50', dependOn: ['colors', 'gray', '50'] }
 *
 * Token: {
 *   namePath: [ 'shadow', 'flat' ],
 *   value: [{ offsetX: '0px', offsetY: '1px', blur: '0px', spread: '0px', color: '#e1e1e2' }],
 *   type: 'shadow'
 * }
 * Result: { value: '0px 1px 0px 0px #e1e1e2', dependOn: [] }
 */
export function transformTokenValue(
  token: DesignToken,
  options: ScssifyTokenExecutorSchema
): { value: string; dependOn: string[] } | null {
  if (isAliasValue(token.value)) {
    const alias = aliasValue(token.value);
    return {
      value: alias.join('-'),
      dependOn: alias,
    };
  }

  const tokenTransformFn = TRANSFORM_FN[token.type]?.(options);

  if (tokenTransformFn) {
    const value = tokenTransformFn(token);
    return value ? { value, dependOn: [] } : null;
  }

  Logger.warning(
    `\n-  WARNING: Unsupported type (${JSON.stringify(
      token.type
    )}), we skip this type from tokens.\n   Here is the list of types, that currently supported by us: \n   ${Object.values(
      DesignTokenType
    ).join(', ')}\n   the token value is: ${JSON.stringify(token)}\n`
  );
  return null;
}
