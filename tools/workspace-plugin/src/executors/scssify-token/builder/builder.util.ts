import { execSync } from 'child_process';

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
 */
export function sanitizeCSSVariableName(namePath: string[]): string {
  const variableName = namePath.join('-');
  const invalidChars = /[^a-zA-Z0-9-_]/g;
  const sanitizedVariableName = variableName.replace(invalidChars, '');

  return sanitizedVariableName;
}
