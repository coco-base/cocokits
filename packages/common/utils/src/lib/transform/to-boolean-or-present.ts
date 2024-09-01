/**
 * Converts a potentially undefined, null, or string value to a boolean.
 * Specifically, it treats the attribute presence (like `disabled` with no value)
 * as `true`, and interprets the string "false" explicitly as `false`.
 * Other non-null/undefined values are treated as `true`.
 *
 * @param {any} value - The value to convert, can be of any type.
 * @returns {boolean} - The boolean result of the conversion.
 *
 * @example
 * toBooleanOrPresent('false') => false;
 * toBooleanOrPresent('FALSE') => false;
 * toBooleanOrPresent(null) => false;
 * toBooleanOrPresent('') => true;
 * toBooleanOrPresent('true') => true;
 * toBooleanOrPresent('yes') => true;
 *
 * Angular:
 * disabled = input(null, {transform: toBooleanOrPresent})
 * @Input({transform: toBooleanOrPresent}) disabled: boolean;
 *
 *
 * <button disabled>Click me</button> -> true
 * <button [disabled]="true">Click me</button> -> true
 * <button [disabled]="yes">Click me</button> -> true
 * <button>Click me</button> -> false
 * <button [disabled]="false">Click me</button> -> false
 * <button [disabled]="FALSE">Click me</button> -> false
 *
 */
export function toBooleanOrPresent(value: any): boolean {
  return value !== null && `${value}`.toLowerCase() !== 'false';
}
