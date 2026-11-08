import { sortByDomOrder } from '@cocokits/utils';

/**
 * Sorts items by the rendered order of their elements, as `sortByDomOrder` sorts elements. An item whose element is
 * not in the page goes after the others, in the order it was given. Items that name the same element are all kept,
 * next to each other, in the order they were given.
 *
 * @param items - The items to order; not changed.
 * @param elementOf - The element of an item.
 * @returns A new array in rendered order.
 * @internal
 */
export function sortByDomOrderOf<T>(items: readonly T[], elementOf: (item: T) => Element): T[] {
  const byElement = new Map<Element, T[]>();
  for (const item of items) {
    const element = elementOf(item);
    const group = byElement.get(element);
    if (group) group.push(item);
    else byElement.set(element, [item]);
  }
  return sortByDomOrder([...byElement.keys()]).flatMap((element) => byElement.get(element) ?? []);
}
