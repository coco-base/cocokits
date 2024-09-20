/** @module ensure */

/**
 * Determines whether the provided value is a non-blank `string`.
 *
 * @param value The value to check.
 * @returns Returns `true` if the value is a non-null, non-undefined string and not blank, otherwise `false`.
 *
 * @example
 * ```
 * console.log(isStringAndNotBlank('hello')); // Output: true
 * console.log(isStringAndNotBlank('   ')); // Output: false
 * console.log(isStringAndNotBlank(null)); // Output: false
 * ```
 */
export function isStringAndNotBlank(value: any): value is Exclude<string, null | undefined> {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Determines whether the provided value is a `string`.
 *
 * @param value The value to check.
 * @returns Returns `true` if the value is a string, otherwise `false`.
 *
 * @example
 * // Example 1: Check if a value is a string
 * console.log(isString('hello'));    // Output: true
 * console.log(isString(123));        // Output: false
 * console.log(isString(null));       // Output: false
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

/**
 * Determines whether the provided value is not a `string`.
 *
 * @template T The type of the value being checked.
 * @param value The value to check.
 * @returns Returns `true` if the value is not a string, otherwise `false`.
 *
 * @example
 * ```typescript
 * console.log(isNotString(123));     // true
 * console.log(isNotString('hello')); // false
 * console.log(isNotString(true));    // true
 * ```
 */
export function isNotString<T>(value: T): value is Exclude<T, string> {
  return !isString(value);
}
