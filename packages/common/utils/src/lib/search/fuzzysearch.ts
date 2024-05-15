/**
 * https://github.com/bevacqua/fuzzysearch
 * The library has no typescript export, therefore we copy the source code into our project.
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
