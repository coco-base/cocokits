/** @module ensure */

/**
 * Determines whether the provided value is `null` or `undefined`.
 *
 * @param value The value to check.
 * @returns Returns `true` if the value is `null` or `undefined`, otherwise `false`.
 *
 * @example
 * ```typescript
 * console.log(isNullish(null));       // true
 * console.log(isNullish(undefined));  // true
 * console.log(isNullish('value'));    // false
 * ```
 */
export function isNullish(value: any): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Determines whether the provided value is not `null` or `undefined`.
 *
 * @template T The type of the value being checked.
 * @param value The value to check.
 * @returns Returns `true` if the value is neither `null` nor `undefined`, otherwise `false`.
 *
 * @example
 * ```typescript
 * console.log(isNotNullish(42));        // true
 * console.log(isNotNullish(null));      // false
 * console.log(isNotNullish(undefined)); // false
 * ```
 */
export function isNotNullish<T>(value: T): value is Exclude<T, null | undefined> {
  return !isNullish(value);
}
