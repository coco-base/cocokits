import { parseToRgba, rgba, toHex } from 'color2k';

import { recordForEach } from '@cocokits/common-utils';

import {
  DTMRawColorTokenValue,
  DTMRawDimensionTokenValue,
  DTMRawGradientTokenValue,
  DTMRawShadowTokenValue,
  DTMRawStringTokenValue,
  DTMRawTypographyTokenValue,
  DTMTokenRawValue,
} from './design-tokens-manager.model';
import { hasUnit, toAliasOrTokenValue } from './util';
import { Logger } from '../../../../utils/logger';
import { TokenDictionary, TokenMap, TokenType } from '../../token.model';

const TRANSFORM_FN: Record<TokenType, (tokenRawValue: DTMTokenRawValue, tokenMap: TokenMap) => string> = {
  color: getColorValue,
  string: getStringValue,
  dimension: getDimensionValue,
  typography: getFontValue,
  gradient: getGradientValue,
  shadow: getShadowValue,
};

export function fillValueTokenDictionary(tokenDictionary: TokenDictionary) {
  recordForEach(tokenDictionary.tokenMap, (token) => {
    recordForEach(token.modes, (tokenValue) => {
      const rawValue = tokenValue.rawValue as DTMTokenRawValue;

      if (tokenValue.aliasTokenId) {
        const alias = tokenDictionary.tokenMap[tokenValue.aliasTokenId];
        tokenValue.value = alias.variable.css;
        return;
      }

      const transformFn = TRANSFORM_FN[token.type];

      if (!transformFn) {
        throw new Error(`Unsupported token type. the current token is ${token.type}.`);
      }

      tokenValue.value = transformFn(rawValue, tokenDictionary.tokenMap);
    });
  });
}

/**
 * Converts a design token for color to its corresponding RGBA value.
 * It processes the token to determine whether it is a string or an object
 * with RGB and alpha values, and returns the corresponding RGBA value string.
 *
 * @returns An RGBA value string for the color.
 */
function getColorValue(tokenRawValue: DTMRawColorTokenValue): string {
  if (typeof tokenRawValue === 'string') {
    return toHex(tokenRawValue);
  }

  const [r, g, b] = parseToRgba(tokenRawValue.value);
  const alphaColor = rgba(r, g, b, tokenRawValue.alpha);
  return toHex(alphaColor);
}

/**
 * Converts a design token for dimension to its corresponding pixel value.
 * It processes the token to determine whether it uses 'rem' or 'px' units
 * and returns the corresponding pixel value string.
 * If the unit is unsupported, it logs a warning and returns the value in pixels.
 *
 * @returns A pixel value string for the dimension.
 */
function getDimensionValue(tokenRawValue: DTMRawDimensionTokenValue): string {
  const baseFont = 16;
  const floatVal = parseFloat(tokenRawValue);

  if (isNaN(floatVal)) {
    throw new Error(`Invalid dimension token: '${tokenRawValue}' is not valid and cannot be transform to 'float' \n`);
  }

  if (floatVal === 0) {
    return '0';
  }

  if (hasUnit(tokenRawValue, 'rem')) {
    return `${floatVal * baseFont}px`;
  }

  if (hasUnit(tokenRawValue, 'px')) {
    return `${floatVal}px`;
  }

  Logger.warning(`Unsupported unit: ${tokenRawValue}. Use default format: ${floatVal}px`);

  return `${floatVal}px`;
}

/**
 * Generates a CSS value string for a given typography design token.
 * It processes the token to construct the corresponding CSS value string
 * including font style, weight, size, line height, and family.
 *
 * @returns A CSS value string for the typography.
 */
function getFontValue(tokenRawValue: DTMRawTypographyTokenValue, tokenMap: TokenMap): string {
  const fontStyle = toAliasOrTokenValue(tokenRawValue.fontStyle ?? '', tokenMap);
  const fontWeight = toAliasOrTokenValue(tokenRawValue.fontWeight, tokenMap);
  const fontSize = toAliasOrTokenValue(tokenRawValue.fontSize, tokenMap);
  const lineHeight = `/ ${toAliasOrTokenValue(tokenRawValue.lineHeight, tokenMap)}`;
  const fontFamily = toAliasOrTokenValue(tokenRawValue.fontFamily, tokenMap);

  return `${fontStyle} ${fontWeight} ${fontSize} ${lineHeight} ${fontFamily}`.trim();
}

/**
 * Generates a CSS gradient string for a given gradient design token.
 * It processes the token to construct the corresponding CSS value string
 * including the gradient type, angle, and color stops.
 *
 * @returns A CSS gradient string for the gradient.
 */
function getGradientValue(tokenRawValue: DTMRawGradientTokenValue, tokenMap: TokenMap): string {
  const toStop = (stop: DTMRawGradientTokenValue['stops'][number]): string => {
    const positionPercentage = stop.position ? ` ${Math.floor(stop.position * 100)}%` : '';
    const color = toAliasOrTokenValue(stop.color, tokenMap);
    return `${color}${positionPercentage}`;
  };

  const stops: string = tokenRawValue.stops.map((stop) => toStop(stop)).join(', ');

  return tokenRawValue.type === 'linear'
    ? `linear-gradient(${tokenRawValue.angle ? tokenRawValue.angle + 'deg, ' : ''}${stops})`
    : `radial-gradient(circle, ${stops})`;
}

/**
 * Generates a CSS value for a given shadow design token. It processes the token
 * to determine whether it represents a blur or a shadow and constructs the corresponding
 * CSS value string.
 *
 * @returns {string} - A CSS value string for the shadow.
 */
function getShadowValue(tokenRawValue: DTMRawShadowTokenValue, tokenMap: TokenMap): string {
  // Blue
  if ('blur' in tokenRawValue) {
    return toAliasOrTokenValue(tokenRawValue.blur, tokenMap);
  }

  // Shadow
  const shadows = tokenRawValue.map((value) => {
    const inset = toAliasOrTokenValue(value.inset, tokenMap);
    const offsetX = toAliasOrTokenValue(value.offsetX, tokenMap);
    const offsetY = toAliasOrTokenValue(value.offsetY, tokenMap);
    const blur = toAliasOrTokenValue(value.blur, tokenMap);
    const spread = toAliasOrTokenValue(value.spread, tokenMap);
    const color = toAliasOrTokenValue(value.color, tokenMap);

    return `${inset ? 'inset' : ''} ${offsetX} ${offsetY} ${blur} ${spread} ${color}`.trim();
  });

  return shadows.join(', ');
}

function getStringValue(tokenRawValue: DTMRawStringTokenValue): string {
  return tokenRawValue.trim();
}
