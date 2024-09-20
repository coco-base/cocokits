/** @module ensure */

import { isNotArray } from './ensure-array';

/**
 * Determines whether the provided value is an `object` (excluding `null` and arrays).
 *
 * @param value The value to check.
 * @returns Returns `true` if the value is a non-null object and not an array, otherwise `false`.
 *
 * @example
 * ```typescript
 * console.log(isObject({}));       // true
 * console.log(isObject(null));     // false
 * console.log(isObject([]));       // false
 * console.log(isObject('string')); // false
 * ```
 */
export function isObject(value: any): value is object {
  return typeof value === 'object' && value !== null && isNotArray(value);
}

/**
 * Determines whether the provided value is not an `object` (i.e., excluding non-null objects).
 *
 * @template T The type of the value being checked.
 * @param value The value to check.
 * @returns Returns `true` if the value is not an object, otherwise `false`.
 *
 * @example
 * ```typescript
 * console.log(isNutObject(42));       // true
 * console.log(isNutObject(null));     // true
 * console.log(isNutObject({}));       // false
 * console.log(isNutObject('string')); // true
 * ```
 */
export function isNutObject<T>(value: T): value is Exclude<T, object> {
  return !isObject(value);
}
