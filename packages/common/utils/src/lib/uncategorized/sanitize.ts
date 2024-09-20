/** @module common */

import { isNotNullish } from '../ensure/ensure-nullish';

/**
 * Sanitizes the input value by converting specific string representations to their corresponding types.
 *
 * - If the input value is the string `'null'`, it returns `null`.
 * - If the input value is the string `'undefined'` or an empty string, it returns `undefined`.
 * - If the input value is `'true'`, it returns the boolean `true`.
 * - If the input value is `'false'`, it returns the boolean `false`.
 * - If the input value is a valid number string, it converts and returns the number.
 * - Otherwise, it returns the original input value.
 *
 * @param value The value to sanitize, which can be a string, number, boolean, `null`, or `undefined`.
 *
 * @returns The sanitized value, which can be a string, number, boolean, `null`, or `undefined`.
 *
 * @example
 * ```typescript
 * sanitizeValue('null');       // null
 * sanitizeValue('undefined');  // undefined
 * sanitizeValue('');           // undefined
 * sanitizeValue('hello');      // 'hello'
 * sanitizeValue(null);         // null
 * sanitizeValue(undefined);    // undefined
 * sanitizeValue('true');       // true
 * sanitizeValue('false');      // false
 * sanitizeValue('1.2');        // 1.2
 * sanitizeValue('1x');         // '1x'
 * ```
 */
export function sanitizeValue(
  value: string | number | boolean | null | undefined
): string | number | boolean | null | undefined {
  if (value === 'null') {
    return null;
  }
  if (value === 'undefined' || value === '') {
    return undefined;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  if (!isNaN(Number(value)) && isNotNullish(value)) {
    return Number(value);
  }
  return value;
}
