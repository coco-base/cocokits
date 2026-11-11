import { composedParent } from './composed-parent';

/**
 * Checks whether a container holds a node, also when the node is in a shadow tree below the container.
 * A node holds itself.
 *
 * @remarks
 * It walks up from the node through parents and shadow hosts. It reads the DOM only when you call it.
 *
 * @param container - The possible ancestor.
 * @param node - The node to look for. `null` is never contained.
 * @returns `true` when the node is the container or is below it, across shadow roots.
 * @example
 * const dialog = document.querySelector('dialog')!;
 * const inside = containsDeep(dialog, document.activeElement);
 */
export function containsDeep(container: Node, node: Node | null): boolean {
  for (let current = node; current; current = composedParent(current)) {
    if (current === container) return true;
  }
  return false;
}
