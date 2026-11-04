import { composedParent } from './composed-parent';

/**
 * Whether `container` holds `node`, also when `node` sits in a shadow tree below it. A node holds
 * itself. It walks up from `node` through parents and shadow hosts and reads the DOM only when called.
 *
 * @param container - The possible ancestor.
 * @param node - The node to look for; `null` is never contained.
 * @returns `true` when `node` is `container` or below it, shadow roots crossed.
 */
export function containsDeep(container: Node, node: Node | null): boolean {
  for (let current = node; current; current = composedParent(current)) {
    if (current === container) return true;
  }
  return false;
}
