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
 */
export function sanitizeString(value: string | null | undefined): string | null | undefined {
  if (value === 'null') {
    return null;
  }
  if (value === 'undefined' || value === '') {
    return undefined;
  }
  return value;
}
