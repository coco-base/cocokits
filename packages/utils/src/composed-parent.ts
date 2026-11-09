/**
 * Finds the parent of a node in the composed tree. That is the parent node, or the host element when the node
 * is the root of a shadow tree. Walk up with it to cross shadow roots.
 *
 * @remarks
 * It reads the DOM only when you call it.
 *
 * @param node - The node to start from.
 * @returns The parent or the shadow host, or `null` at the top of the tree.
 * @example
 * const button = document.querySelector('button')!;
 * for (let node: Node | null = button; node; node = composedParent(node)) {
 *   console.log(node.nodeName);
 * }
 */
export function composedParent(node: Node): Node | null {
  return node.parentNode ?? (node as Partial<ShadowRoot>).host ?? null;
}
