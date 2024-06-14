import { execSync } from 'child_process';
import { CSSVariableName, TsStringVariableName, TsVariableMap } from '../token.model';
import * as _ from 'lodash';

/**
 * Name of the folder containing mixins.
 * The final result will be: `${outputDir}/mixins`
 */
export const MIXINS_FOLDER_NAME = 'mixins';

/**
 * Name of the folder containing css variables.
 * The final result will be: `${outputDir}/css-variables`
 */
export const CSS_VARIABLES_FOLDER_NAME = 'css-variables';

/**
 * Name of the folder containing scss variables.
 * The final result will be: `${outputDir}/scss-variables`
 */
export const SCSS_VARIABLES_FOLDER_NAME = 'scss-variables';

/**
 * Name of the folder containing ts css-variables.
 * The final result will be: `${outputDir}/ts-css-variables`
 */
export const TS_CSS_VARIABLES_FOLDER_NAME = 'ts-css-variables';

/**
 * Name of the folder containing ts css-variables.
 * The final result will be: `${outputDir}/ts-variables`
 */
export const TS_VARIABLES_FOLDER_NAME = 'ts-variables';

/**
 * Remove all files and folder in specified directory.
 */
export function clearDir(dirPath: string) {
  execSync(`rm -rf ${dirPath}`);
}

/**
 * Sanitizes a mixin name by replacing dots with double underscores.
 * @example
 *  'color-mode.dark' -> 'color-mode__dark'
 *  ```
 *     @mixin color-mode__dark {...}
 *  ```
 */
export function sanitizeMixinName(mixinName: string): string {
  return mixinName.replaceAll('.', '__');
}

/**
 * Sanitizes a CSS selector name by replacing dots with double dashes.
 * @example
 *  `color-mode.dark` -> `color-mode--dark`
 *  ```
 *     :where(.theme-default__color-mode--dark) {...}
 *  ```
 */
export function sanitizeCSSSelectorName(mixinName: string): string {
  return mixinName.replaceAll('.', '--');
}

/**
 * Sanitizes a value by wrapping it in a CSS variable if it's an alias.
 */
export function sanitizeValue(value: string, isAlias: boolean): string {
  return isAlias ? `var(--${value})` : value;
}

/**
 * Sanitizes a CSS variable name by joining name path elements with dashes and removing invalid characters.
 * @example [ 'color-palette', 'cyan', '950' ] -> color-palette-cyan-950
 */
export function sanitizeCSSVariableName(namePath: string[]): CSSVariableName {
  const variableName = namePath.join('-');
  const invalidChars = /[^a-zA-Z0-9-_]/g;
  const sanitizedVariableName = variableName.replace(invalidChars, '');

  return sanitizedVariableName;
}

/**
 * Sanitizes a Ts variable name by using camelCase style.
 * @example [ 'color-palette', 'cyan', '950' ] -> [ 'colorPalette', 'cyan', '950' ]
 */
export function sanitizeTsVariableName(namePath: string[]): string[] {
  const camelCaseNamePath = namePath.map((name) => _.camelCase(name));
  return camelCaseNamePath;
}

/**
 * Sanitizes a Ts variable name by using camelCase style.
 * @example [ 'color-palette', 'cyan', '950' ] -> 'colorPalette.cyan.950'
 */
export function sanitizeTsStringVariableName(namePath: string[]): TsStringVariableName {
  const camelCaseNamePath = namePath.map((name) => _.camelCase(name));
  return camelCaseNamePath.join('.');
}

/**
 * Build a js map from namePath and value
 * Example:
 * [ 'colorPalette', 'cyan', '950' ] -> { colorPalette: { cyan: { 950: VALUE } } }
 */
export function buildTsVariableMap(namePath: string[], value: string): TsVariableMap {
  if (namePath.length < 1) {
    throw new Error(`The 'namePath' has no item to build ts variable. namePath: ${namePath}, value: ${value}`);
  }

  const isLast = namePath.length === 1;

  if (isLast) {
    return { [namePath[0]]: value };
  }

  const namePathWithoutFirst = namePath.slice(1, namePath.length);
  return { [namePath[0]]: buildTsVariableMap(namePathWithoutFirst, value) };
}
