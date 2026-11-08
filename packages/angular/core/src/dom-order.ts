import { afterEveryRender, computed, signal, type Signal } from '@angular/core';
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

/** A list of items that keeps itself in the document order of their elements. */
export interface DomOrderedList<T> {
  /** The items in document order. */
  readonly items: Signal<readonly T[]>;
  /**
   * Adds an item.
   *
   * @param item - The item to add.
   * @returns The function that removes it again.
   */
  add(item: T): () => void;
}

/**
 * Creates a list of registered items in the document order of their elements. The order is read where `items` is
 * computed, so the server render and the first client render are in order, also for an item that `@if` or `@for`
 * created after its static siblings. After every render it checks whether a render moved an item (a reordered `@for`)
 * and then sorts again. Call it in an injection context.
 *
 * @param elementOf - The element of an item.
 * @returns The list.
 * @internal
 */
export function domOrderedList<T>(elementOf: (item: T) => Element): DomOrderedList<T> {
  const added = signal<readonly T[]>([]);
  const moved = signal(0);
  const items = computed(() => {
    moved();
    return sortByDomOrderOf(added(), elementOf);
  });
  afterEveryRender({
    read: () => {
      const current = items();
      if (sortByDomOrderOf(current, elementOf).some((item, index) => item !== current[index])) {
        moved.update((count) => count + 1);
      }
    },
  });
  return {
    items,
    add: (item) => {
      added.update((list) => [...list, item]);
      return () => {
        added.update((list) => list.filter((other) => other !== item));
      };
    },
  };
}
