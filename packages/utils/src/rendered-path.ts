import { isShadowRoot } from './is-shadow-root';

/** `Node.ELEMENT_NODE` and `Node.DOCUMENT_NODE`, as numbers so the module needs no `Node` global (server rendering). */
const ELEMENT = 1;
const DOCUMENT = 9;

/** The position of `child` among the elements of `parent`. */
function indexIn(parent: ParentNode, child: Element): number {
  return Array.from(parent.children).indexOf(child);
}

/**
 * The rendered path of an element: its index at every level of the rendered tree, from the document
 * down. An open shadow tree stands in for the children of its host, and a slot's assigned nodes stand
 * in for the slot. Two paths compare like the elements' order on screen. `null` when the element is
 * not rendered: detached, in another document than `doc`, or a light child no slot takes.
 *
 * @internal
 */
export function renderedPath(element: Element, doc: Document): number[] | null {
  const path: number[] = [];
  let current: Element = element;
  for (;;) {
    const slot = current.assignedSlot;
    if (slot) {
      path.unshift(slot.assignedNodes().indexOf(current));
      current = slot;
      continue;
    }
    const parent: Node | null = current.parentNode;
    if (!parent) return null;
    if (parent.nodeType === DOCUMENT) return parent === doc ? path : null;
    if (isShadowRoot(parent)) {
      path.unshift(indexIn(parent, current));
      current = parent.host;
    } else if (parent.nodeType === ELEMENT) {
      // A light child of a host that no slot took is not drawn.
      if ((parent as Element).shadowRoot) return null;
      path.unshift(indexIn(parent as Element, current));
      current = parent as Element;
    } else {
      return null;
    }
  }
}
