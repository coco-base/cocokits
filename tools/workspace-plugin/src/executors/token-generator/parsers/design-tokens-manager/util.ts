import fs from 'fs';

import { recordForEach } from '@cocokits/common-utils';
import {
  TokenCollectionName,
  TokenDictionary,
  TokenGroupsNameCollectionName,
  TokenId,
  TokenMap,
  TokenNamePath,
} from '@cocokits/core';

import { DTMManifest, DTMTokenGroup, DTMTokenValue } from './design-tokens-manager.model';
import { fontWeightToNumber } from './font-weight-to-number';
import { TokenGeneratorExecutorSchema } from '../../schema';

/**
 * Reads a manifest file from the given file paths and returns the parsed DTMManifest object.
 */
export function readManifest(options: TokenGeneratorExecutorSchema): DTMManifest {
  if (options.files.length !== 1) {
    throw new Error(`Files in 'design token manger' but be only the path to the manifest token`);
  }

  const manifest = JSON.parse(fs.readFileSync(options.files[0], { encoding: 'utf8' })) as DTMManifest;

  options.excludeCollections.forEach((excludeCollection) => {
    delete manifest.collections[excludeCollection];
  });

  return manifest;
}

/**
 * Converts a name of collection or mode to a sanitized format by replacing spaces with hyphens, converting to lowercase and removing invalid characters.
 * "Color Palate" -> "color-palate"
 */
export function toName(name: string): string {
  const invalidChars = /[^a-zA-Z0-9-_]/g;
  return name.replaceAll(' ', '-').replace(invalidChars, '').toLowerCase().trim();
}

export function toTokenId(namePath: TokenNamePath) {
  return namePath.join('__');
}

/**
 * Checks if the design token value is an alias.
 * An alias is a string that starts with '{' and ends with '}'.
 * For example, '{spacing.space.0}' is an alias and '4px' is a real value.
 *
 * @param value The value to check if it is an alias.
 * @returns True if the value is an alias, otherwise false.
 */
export function isAliasValue(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('{') && value.endsWith('}');
}

/**
 * Extracts alias values from a string.
 *
 * @param value - The alias string to extract values from.
 * @returns The extracted alias values.
 *
 * @example
 * value: '{Color Palate.Gray.50}';
 * result: 'color-palate__gray__50'
 */
export function getTokenIdFromAliasValue(value: string): TokenId {
  const tokenAliasNamePath = value
    .substring(1, value.length - 1) // Remove '{' at start and '}' at the end
    .toLowerCase()
    .trim()
    .split('.');

  return toTokenId(tokenAliasNamePath);
}

/**
 * Converts a DTM design token value to our standard token value.
 */
export function toRawValue(
  value: DTMTokenValue,
  tokenNamePath: TokenNamePath,
  options: TokenGeneratorExecutorSchema
): any {
  const isFontWeight = matchPattern(options.fontWeightPattern, tokenNamePath.join('/'));
  if (isFontWeight && value.$type === 'string') {
    return fontWeightToNumber(value.$value);
  }

  switch (value.$type) {
    // NOTE: DTM (Design Token Manager) plugin in Firma, use 'Blue' instead of 'Blur'
    case 'shadow':
      return 'backgroundBlue' in value.$value[0]
        ? { blur: value.$value[0].blur } // Blur
        : value.$value; // Shadow

    default:
      return value.$value;
  }
}

export function toAliasOrTokenValue<T>(value: string | T, tokenMap: TokenMap): string | T {
  return isAliasValue(value) ? tokenMap[getTokenIdFromAliasValue(value)]?.variable.css : value;
}

/**
 * Checks if the given token is a design token value, and it's no a group.
 */
export function hasDTMTokenValue(token: DTMTokenGroup | DTMTokenValue): token is DTMTokenValue {
  return typeof token === 'object' && '$value' in token;
}

export function validateUniqGroupNameInCollections(tokenDictionary: TokenDictionary): void {
  const groupsNameCollectionName: TokenGroupsNameCollectionName = {};

  recordForEach(tokenDictionary.collectionGroupHierarchy, (groups, collectionName: TokenCollectionName) => {
    Object.keys(groups).forEach((groupName: TokenCollectionName) => {
      if (groupsNameCollectionName[groupName]) {
        throw new Error(
          `A Token group name can be be repeat in multi collections. '${groupName}' has defined is the following collection: '${collectionName}' and '${groupsNameCollectionName[groupName]}'`
        );
      }
    });
  });
}

/**
 * @description checks if token value has a specific unit
 * @param value token value
 * @param unit unit string like px or value
 * @returns boolean
 */
export function hasUnit(value: string | number, unit: string): boolean {
  if (typeof value === 'number') {
    return false;
  }

  return value.indexOf(unit) > -1;
}

/**
 * Checks if a given value matches a specified pattern.
 * The pattern can contain a wildcard '*' which matches any sequence of characters.
 *
 * @param {string} pattern - The pattern to match, e.g., 'colors/*'.
 *    - The pattern may contain '*' as a wildcard character that matches any sequence of characters.
 * @param {string} value - The value to compare against the pattern, e.g., 'colors/blue' or 'size/sm/100'.
 * @returns {boolean} - Returns true if the value matches the pattern, otherwise returns false.
 *
 * @example
 * matchPattern('colors/*', 'colors/blue'); // true
 * matchPattern('colors/**', 'colors/blue'); // true
 * matchPattern('colors/*', 'size/sm/100'); // false
 * matchPattern('colors/*', 'colors/blue/100'); // true
 * matchPattern('colors/*', 'color/blue'); // false
 * matchPattern('colors/* /100', 'color/blue'); // false
 * matchPattern('colors/* /100', 'color/blue/100'); // true
 * matchPattern('colors/* /100/*', 'color/blue/100'); // false
 * matchPattern('colors/* /100/*', 'color/blue/100/50'); // true
 * matchPattern('colors/* /100/*', 'color/blue/100/50/80'); // true
 *
 * The function works by:
 * 1. Escaping special characters in the pattern to ensure they are treated as literals in the regex.
 * 2. Replacing the wildcard character '*' in the pattern with '.*' to create a regex pattern that matches any sequence of characters.
 * 3. Adding '^' at the beginning and '$' at the end of the regex pattern to ensure the entire string is matched.
 * 4. Testing the value against the constructed regex pattern.
 */
export function matchPattern(pattern: string, value: string): boolean {
  if (!pattern) {
    return false;
  }

  // Escape special characters and replace '*' with '.*' to create a regex pattern
  const regexPattern = new RegExp(`^${pattern.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*')}$`);

  // Test the value against the regex pattern
  return regexPattern.test(value);
}
