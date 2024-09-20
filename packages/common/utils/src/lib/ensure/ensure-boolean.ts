/** @module ensure */

/**
 * Determines whether the provided value is a boolean.
 *
 * @param value The value to check.
 * @returns Returns `true` if the value is a boolean, otherwise `false`.
 *
 * @example
 * ```typescript
 * console.log(isBoolean(true)); // true
 * console.log(isBoolean(42));   // false
 * ```
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Determines whether the provided value is not a boolean.
 *
 * @template T The type of the value being checked.
 * @param value The value to check.
 * @returns Returns `true` if the value is not a boolean, otherwise `false`.
 *
 * @example
 * ```typescript
 * console.log(isNotBoolean(42));    // true
 * console.log(isNotBoolean(false)); // false
 * ```
 */
export function isNotBoolean<T>(value: T): value is Exclude<T, boolean> {
  return !isBoolean(value);
}
