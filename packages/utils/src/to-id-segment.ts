/**
 * Encodes a consumer value so it can be part of an element id. Letters, digits and `-` stay; every other
 * character (and `_`, the escape character) becomes `_` plus its code point in hex and a closing `_`. A number
 * becomes `_n_` plus its encoded text: the hex digits of an escape never include `n`, so no string starts with
 * `_n_`. The encoding is injective across `string | number`: two values that differ only in whitespace,
 * punctuation or type (`1` and `'1'`) never share an id.
 *
 * @param value - The consumer value, for example a tab `value`.
 * @returns A string of `A-Z a-z 0-9 - _` only; empty for an empty string.
 */
export function toIdSegment(value: string | number): string {
  if (typeof value === 'number') return `_n_${toIdSegment(String(value))}`;
  let segment = '';
  for (const char of value) {
    segment += /[A-Za-z0-9-]/.test(char) ? char : `_${char.codePointAt(0)?.toString(16) ?? ''}_`;
  }
  return segment;
}
