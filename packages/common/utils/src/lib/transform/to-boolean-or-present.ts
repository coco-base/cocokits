/** @module transform */

/**
 * Converts a potentially undefined, null, or string value to a boolean.
 * Specifically, it treats the attribute presence (like `disabled` with no value)
 * as `true`, and interprets the string "false" explicitly as `false`.
 * Other non-null/undefined values are treated as `true`.
 *
 * @param value - The value to convert, can be of any type.
 * @returns The boolean result of the conversion.
 *
 * @example
 * ```typescript
 * toBooleanOrPresent('false'); // false;
 * toBooleanOrPresent('FALSE'); // false;
 * toBooleanOrPresent(null); // false;
 * toBooleanOrPresent(''); // true;
 * toBooleanOrPresent('true'); // true;
 * toBooleanOrPresent('yes'); // true;
 * ```
 *
 * @example
 *
 * Use it in Angular
 * ```typescript
 * disabled = input(undefined, {transform: toBooleanOrPresent})
 * // or
 * @Input({transform: toBooleanOrPresent}) disabled: boolean;
 * ```
 * ```html
 * <button disabled>Click me</button> <!-- true -->
 * <button [disabled]="true">Click me</button> <!-- true -->
 * <button [disabled]="yes">Click me</button> <!-- true -->
 * <button>Click me</button> <!-- false -->
 * <button [disabled]="false">Click me</button> <!-- false -->
 * <button [disabled]="FALSE">Click me</button> <!-- false -->
 * ```
 *
 */
export function toBooleanOrPresent(value: any): boolean {
  return value !== null && value !== undefined && `${value}`.toLowerCase() !== 'false';
}
