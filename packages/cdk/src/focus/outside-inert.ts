import { composedParent } from '@cocokits/utils';

/** How many releases an element still waits for, and whether `inert` was ours to add. */
interface Hold {
  count: number;
  readonly own: boolean;
}

const holds = new WeakMap<Element, Hold>();

function acquire(element: Element): void {
  const hold = holds.get(element);
  if (hold) {
    hold.count += 1;
    return;
  }
  const own = !element.hasAttribute('inert');
  holds.set(element, { count: 1, own });
  if (own) element.setAttribute('inert', '');
}

function release(element: Element): void {
  const hold = holds.get(element);
  if (!hold) return;
  hold.count -= 1;
  if (hold.count > 0) return;
  holds.delete(element);
  if (hold.own) element.removeAttribute('inert');
}

/** The siblings, in the composed tree, of the nodes on the path from `element` up to the document's `<body>`. */
function outsideOf(inside: readonly Element[], found: Set<Element>): void {
  const path = new Set<Node>();
  for (const element of inside) {
    for (let node: Node | null = element; node; node = composedParent(node)) path.add(node);
  }
  for (const node of path) {
    const parent = composedParent(node);
    // The `<html>` element's own children (`<head>`, `<body>`) are not content.
    if (!parent || (parent as Element).localName === 'html') continue;
    for (const sibling of Array.from((parent as ParentNode).children)) {
      if (!path.has(sibling)) found.add(sibling);
    }
  }
}

/**
 * Makes everything outside the given elements inert, so it takes no pointer, focus or assistive-technology
 * access: it sets `inert` on the siblings of every ancestor of the elements, up to the `<body>`, shadow
 * roots crossed. What is added to the document later (an overlay host opened from the content) is not
 * touched, so it stays usable. An element that was already `inert` is left alone, and the release removes
 * only what this call set (two calls that share an element keep it inert until both are released).
 *
 * @param inside - The elements that stay usable, read once now; `null` entries are skipped.
 * @returns The release; call it when the overlay closes. Idempotent.
 */
export function makeOutsideInert(inside: () => readonly (Element | null)[]): () => void {
  const elements = inside().filter((element): element is Element => element !== null);
  const found = new Set<Element>();
  outsideOf(elements, found);
  found.forEach(acquire);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    found.forEach(release);
  };
}
