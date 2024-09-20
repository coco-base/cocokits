/** @module ensure */

/**
 * Checks if the provided value is an array.
 *
 * @template T The type of elements the array is expected to contain.
 * @param value The value to check if it is an array.
 * @returns Returns true if the value is an array, otherwise false.
 *
 * @example
 * ```typescript
 * const result = isArray([1, 2, 3]); // true
 * const result2 = isArray('string'); // false
 * ```
 */
export function isArray<T>(value: any): value is Array<T> {
  return Array.isArray(value);
}

/**
 * Checks if the provided value is *not* an array.
 *
 * @template T The type of elements the array is expected to contain.
 * @param value The value to check if it is not an array.
 * @returns Returns true if the value is not an array, otherwise false.
 *
 * @example
 * ```typescript
 * console.log(isNotArray('string'));   // true
 * console.log(isNotArray([1, 2, 3])); // false
 * ```
 */
export function isNotArray<T, U>(value: T): value is Exclude<T, Array<U>> {
  return !isArray(value);
}
