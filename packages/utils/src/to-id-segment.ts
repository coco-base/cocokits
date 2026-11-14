/**
 * Encodes a value so it is safe to use as part of an element id. Two different values never give the same id.
 *
 * @remarks
 * Letters, digits and `-` stay as they are. Every other character becomes `_`, its code point in hex, and a closing `_`.
 * The underscore is the escape character, so it is encoded too.
 *
 * A number becomes `_n_` plus its encoded text. The hex digits of an escape never include `n`, so no string starts with `_n_`.
 * So values that differ only in whitespace, punctuation or type, such as `1` and `'1'`, never share an id.
 *
 * @param value - The value to encode, for example the value of a tab.
 * @returns A string of `A-Z a-z 0-9 - _` only. It is empty for an empty string.
 * @example
 * const id = `tab-${toIdSegment('a b')}`; // 'tab-a_20_b'
 */
export function toIdSegment(value: string | number): string {
  if (typeof value === 'number') return `_n_${toIdSegment(String(value))}`;
  let segment = '';
  for (const char of value) {
    segment += /[A-Za-z0-9-]/.test(char) ? char : `_${char.codePointAt(0)?.toString(16) ?? ''}_`;
  }
  return segment;
}
