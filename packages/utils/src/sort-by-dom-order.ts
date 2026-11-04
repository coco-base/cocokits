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
 * Sorts elements into rendered order: the order a depth-first walk of what is drawn visits them. An
 * open shadow tree takes the place of its host's children and a slot's assigned nodes take the place
 * of the slot; without shadow roots this is document order. Use it to re-read the items of a
 * collection after they mount, unmount or move. It reads the DOM only when called.
 *
 * The primary document is the document of the first connected element. An element that is not
 * rendered (detached, in another document, or a light child of a shadow host that no slot takes) goes
 * after all rendered ones, in the order it was given. For a set of rendered elements of one document
 * the result is the same for every input order. An empty or one-element list is returned as a copy.
 *
 * @param elements - The elements to order; not changed.
 * @returns A new array in rendered order.
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
