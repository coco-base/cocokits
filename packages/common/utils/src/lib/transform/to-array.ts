/** @module transform */

import { isArray } from '../ensure/ensure-array';
import { isNullish } from '../ensure/ensure-nullish';

/**
 * Converts a single value, an array of values, or a nullish value into an array.
 *
 * This function ensures that the returned value is always an array. If the input is already an array,
 * it returns the array as-is. If the input is a single value, it wraps that value in an array.
 * If the input is `null` or `undefined`, it returns an empty array.
 *
 * @template T The type of the input value.
 * @param value The value to be converted into an array. It can be a single value, an array, or `null`/`undefined`.
 * @returns An array containing the input value, the input array as-is, or an empty array if the input is nullish.
 *
 * ```typescript
 * console.log(toArray(42)); // Outputs: [42]
 * const array = toArray([1, 2, 3]); // Outputs: [1, 2, 3]
 * const array = toArray(null); // Outputs: []
 * ```
 */
export function toArray<T>(value: T | T[]): T[] {
  if (isNullish(value)) {
    return [];
  }

  return isArray(value) ? value : [value];
}
