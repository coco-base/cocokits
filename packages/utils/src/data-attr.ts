/**
 * Turns a boolean into the value of a `data-*` attribute that is either present or absent.
 * Your CSS can then select it with `[data-active]`.
 *
 * @param condition - The fact that the attribute states.
 * @returns `''` when the condition is true. Otherwise `undefined`, which means the attribute is absent. It never returns `"false"`.
 * @example
 * const element = document.querySelector<HTMLElement>('#item')!;
 * const value = dataAttr(true);
 * if (value === undefined) element.removeAttribute('data-active');
 * else element.setAttribute('data-active', value);
 */
export function dataAttr(condition: boolean | null | undefined): '' | undefined {
  return condition ? '' : undefined;
}
