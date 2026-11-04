/**
 * Renders a boolean as a presence `data-*` attribute value.
 *
 * @param condition - The fact the attribute states.
 * @returns `''` when `condition` is true, `undefined` (attribute absent) otherwise. Never `"false"`.
 */
export function dataAttr(condition: boolean | null | undefined): '' | undefined {
  return condition ? '' : undefined;
}
