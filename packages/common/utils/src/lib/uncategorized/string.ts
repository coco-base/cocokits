/** @module common */

/**
 * Safely merges multiple strings into one by filtering out any falsy values and joining the remaining strings.
 *
 * @param {...unknown} str - The values to be merged.
 * @returns {string} The merged string with all falsy values removed.
 *
 * @example
 * ```typescript
 * const result = safeMergeString('Hello', '', 'World', null, undefined, 123, '!');
 * console.log(result); // Output: 'HelloWorld123!'
 * ```
 */
export function safeMergeString(...str: unknown[]): string {
  return str
    .filter((s) => !!s)
    .map((s) => `${s}`)
    .join('');
}
