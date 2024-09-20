/** @module transform */

import { isArray } from '../ensure/ensure-array';

/**
 * Converts a single value or an array of values into an array.
 *
 * This function ensures that the returned value is always an array. If the input is already an array,
 * it returns the array as-is. If the input is a single value, it wraps that value in an array.
 *
 * @template T The type of the input value.
 * @param value The value to be converted into an array. It can either be a single value or an array.
 * @returns An array containing the input value, or the input itself if it's already an array.
 *
 * @example
 * ```typescript
 * console.log(toArray(42)); // Outputs: [42]
 * const array = toArray([1, 2, 3]); // Outputs: [1, 2, 3]
 * ```
 */
export function toArray<T>(value: T | T[]): T[] {
  return isArray(value) ? value : [value];
}
