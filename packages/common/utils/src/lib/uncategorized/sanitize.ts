/** @module common */

import { isNotNullish } from '../ensure/ensure-nullish';

/**
 * Sanitizes the input value by converting specific string representations to their corresponding types.
 *
 * - If the input value is the 'null' as string, it returns `null`.
 * - If the input value is the 'undefined' string or an empty string, it returns `undefined`.
 * - Otherwise, it returns the original input value.
 *
 * @example
 * sanitizeString('null'); // null
 * sanitizeString('undefined'); // undefined
 * sanitizeString(''); // undefined
 * sanitizeString('hello'); // 'hello'
 * sanitizeString(null); // null
 * sanitizeString(undefined); // undefined
 * sanitizeString('true'); // true
 * sanitizeString('false'); // false
 * sanitizeString('1.2'); // 1.2
 * sanitizeString('1x'); // '1x'
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
