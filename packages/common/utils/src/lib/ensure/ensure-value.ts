/** @module ensure */

import { isArray } from './ensure-array';
import { isBlob } from './ensure-blob';
import { isNullish } from './ensure-nullish';
import { isNumberOrNaN } from './ensure-number';
import { isObject } from './ensure-object';
import { isString } from './ensure-string';

/**
 * Determines whether the provided value has a meaningful value.
 * It checks for non-nullish values, non-empty strings, valid numbers, blobs, non-empty arrays, and non-empty objects.
 *
 * @param value The value to check.
 * @returns Returns `true` if the value is not nullish, an empty string, `NaN`, or an empty object/array, otherwise `false`.
 *
 * @example
 * ```typescript
 * console.log(hasValue('hello')); // true
 * console.log(hasValue(''));      // false
 * console.log(hasValue(123));     // true
 * console.log(hasValue(NaN));     // false
 * console.log(hasValue([]));      // false
 * console.log(hasValue({}));      // false
 * ```
 */
export function hasValue(value: any): boolean {
  if (isNullish(value)) {
    return false;
  }
  if (isString(value)) {
    return value.trim() !== '';
  }
  if (isNumberOrNaN(value)) {
    return !isNaN(value);
  }
  if (isBlob(value)) {
    return true;
  }
  if (isArray(value)) {
    return value.length > 0;
  }
  if (isObject(value)) {
    return Object.keys(value).length > 0;
  }

  return true;
}

/**
 * Determines whether the provided value does not have a meaningful value.
 * It negates the result of `hasValue` to identify nullish, empty strings, invalid numbers, empty arrays, or empty objects.
 *
 * @param value The value to check.
 * @returns Returns `true` if the value is nullish, an empty string, `NaN`, or an empty object/array, otherwise `false`.
 *
 * @example
 * ```typescript
 * console.log(hasNotValue(''));   // true
 * console.log(hasNotValue(null)); // true
 * console.log(hasNotValue(123));  // false
 * console.log(hasNotValue([]));   // true
 * console.log(hasNotValue({}));   // true
 * ```
 */
export function hasNotValue(value: any): boolean {
  return !hasValue(value);
}
