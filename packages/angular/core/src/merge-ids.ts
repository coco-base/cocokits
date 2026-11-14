/**
 * Joins id lists into one `aria-describedby` or `aria-labelledby` value: in order, without duplicates.
 *
 * @param lists - Id strings (space separated) or arrays of ids; `null` and `undefined` are skipped.
 * @returns The value, or `null` when there is no id.
 * @internal
 */
export function mergeIds(...lists: readonly (readonly string[] | string | null | undefined)[]): string | null {
  const ids = lists.flatMap((list) => (typeof list === 'string' ? list.split(/\s+/) : (list ?? [])));
  const merged = [...new Set(ids.filter((id) => id !== ''))];
  return merged.length > 0 ? merged.join(' ') : null;
}
