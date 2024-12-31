/** @module transform */

/**
 *
 * Converts a potentially undefined, null, or string value to a numeric representation.
 * If the provided value cannot be parsed as a valid number, an error is thrown.
 *
 * @param value - The value to convert, can be of any type.
 * @returns The numeric result of the conversion.
 *
 * @example
 * ```typescript
 * toNumber(42); // 42
 * toNumber('42'); // 42
 * toNumber('3.14'); // 3.14
 * toNumber('007'); // 7
 * toNumber(''); // 0
 * ```
 *
 * @example
 *
 * Use it in an Angular component:
 * ```typescript
 * rating = input('4.5', { transform: toNumber });
 * // or
 * @Input({ transform: toNumber }) rating: number;
 * ```
 * ```html
 * <input value="3" />
 * <input [value]="'3'" />
 * ```
 */
export function toNumber(value: any): number {
  const number = Number(value);
  if (Number.isNaN(number)) {
    throw new Error(`Could not convert value to number: ${value}`);
  }
  return number;
}
