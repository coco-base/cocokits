import { renderedPath } from './rendered-path';

function comparePaths(first: readonly number[], second: readonly number[]): number {
  const shared = Math.min(first.length, second.length);
  for (let level = 0; level < shared; level += 1) {
    const difference = (first[level] ?? 0) - (second[level] ?? 0);
    if (difference !== 0) return difference;
  }
  return first.length - second.length;
}

/**
 * Sorts elements into rendered order, which is the order that a depth-first walk of the drawn page visits them.
 * Use it to read the items of a collection again after they mount, unmount or move.
 *
 * @remarks
 * An open shadow tree takes the place of the children of its host. The assigned nodes of a slot take the place of the slot.
 * Without shadow roots, rendered order is document order. It reads the DOM only when you call it.
 *
 * The main document is the document of the first connected element. An element that is not rendered goes after all
 * rendered ones, in the order you gave it. Not rendered means detached, in another document, or a light child of a
 * shadow host that no slot takes.
 *
 * For rendered elements of one document, the result is the same for every input order.
 * An empty or one-element list is returned as a copy.
 *
 * @param elements - The elements to order. The list is not changed.
 * @returns A new array in rendered order.
 * @example
 * const items = [...document.querySelectorAll<HTMLElement>('[role="tab"]')].reverse();
 * const ordered = sortByDomOrder(items);
 */
export function sortByDomOrder<T extends Element>(elements: readonly T[]): T[] {
  const doc = elements.find((element) => element.isConnected)?.ownerDocument;
  const rendered: { element: T; path: number[] }[] = [];
  const unrendered: T[] = [];
  for (const element of elements) {
    const path = doc ? renderedPath(element, doc) : null;
    if (path) rendered.push({ element, path });
    else unrendered.push(element);
  }
  rendered.sort((first, second) => comparePaths(first.path, second.path));
  return [...rendered.map((entry) => entry.element), ...unrendered];
}
