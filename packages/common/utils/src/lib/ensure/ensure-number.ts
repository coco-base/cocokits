/** @module ensure */

/**
 * Determines whether the provided value is a `number` or `NaN`.
 *
 * @param value The value to check.
 * @returns Returns `true` if the value is a number (including `NaN`), otherwise `false`.
 *
 * @example
 * ```typescript
 * console.log(isNumberOrNaN(42));      // true
 * console.log(isNumberOrNaN(NaN));     // true
 * console.log(isNumberOrNaN('value')); // false
 * ```
 */
export function isNumberOrNaN(value: any): value is number {
  return typeof value === 'number';
}

/**
 * Determines whether the provided value is a valid `number` (not `NaN`).
 *
 * @param value The value to check.
 * @returns Returns `true` if the value is a valid number and not `NaN`, otherwise `false`.
 *
 * @example
 * ```typescript
 * console.log(isNumber(42));      // true
 * console.log(isNumber(NaN));     // false
 * console.log(isNumber('value')); // false
 * ```
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Determines whether the provided value is not a `number`.
 *
 * @template T The type of the value being checked.
 * @param value The value to check.
 * @returns Returns `true` if the value is not a `number`, otherwise `false`.
 *
 * @example
 * ```typescript
 * console.log(isNotNumber(42));       // false
 * console.log(isNotNumber(NaN));      // false
 * console.log(isNotNumber('value'));  // true
 * ```
 */
export function isNotNumber<T>(value: T): value is Exclude<T, number> {
  return !isNumber(value);
}
