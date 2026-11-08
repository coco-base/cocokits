import { sortByDomOrder } from '@cocokits/utils';

/**
 * Sorts items by the rendered order of their elements, as `sortByDomOrder` sorts elements. An item whose element is
 * not in the page goes after the others, in the order it was given. Two items with the same element keep the last.
 *
 * @param items - The items to order; not changed.
 * @param elementOf - The element of an item.
 * @returns A new array in rendered order.
 * @internal
 */
export function sortByDomOrderOf<T>(items: readonly T[], elementOf: (item: T) => Element): T[] {
  const byElement = new Map(items.map((item) => [elementOf(item), item]));
  return sortByDomOrder([...byElement.keys()]).flatMap((element) => byElement.get(element) ?? []);
}
