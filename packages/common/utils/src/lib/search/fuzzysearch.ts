/** @module search */

/**
 * https://github.com/bevacqua/fuzzysearch
 * The library has no typescript export, therefore we copy the source code into our project.
 */

/**
 * Performs a fuzzy search to determine if the `needle` string is contained within the `haystack` string,
 * in the same order, but not necessarily consecutively.
 *
 * This function is a lightweight and efficient implementation of fuzzy string matching. It checks
 * whether all characters in the `needle` are present in the `haystack`, in the same order.
 *
 * @param needle The smaller string to search for within the `haystack`.
 * @param haystack The larger string in which to search for the `needle`.
 * @returns `true` if the `needle` is found in the `haystack` in the correct order, otherwise `false`.
 *
 * @example
 * ```typescript
 * fuzzysearch('car', 'cartwheel'); // Returns true
 * fuzzysearch('cwhl', 'cartwheel'); // Returns true
 * fuzzysearch('cwhee', 'cartwheel'); // Returns true
 * fuzzysearch('dog', 'cartwheel'); // Returns false
 * ```
 */
export function fuzzysearch(needle: string, haystack: string) {
  const tlen = haystack.length;
  const qlen = needle.length;

  if (qlen > tlen) {
    return false;
  }
  if (qlen === tlen) {
    return needle === haystack;
  }
  outer: for (let i = 0, j = 0; i < qlen; i++) {
    const nch = needle.charCodeAt(i);
    while (j < tlen) {
      if (haystack.charCodeAt(j++) === nch) {
        continue outer;
      }
    }
    return false;
  }
  return true;
}
