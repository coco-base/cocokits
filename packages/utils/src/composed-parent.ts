/**
 * The parent of a node in the composed tree: its parent node, or the host element when the node is
 * the root of a shadow tree. Walk up with it to cross shadow roots. It reads the DOM only when called.
 *
 * @param node - The node to start from.
 * @returns The parent or shadow host, or `null` at the top of the tree.
 */
export function composedParent(node: Node): Node | null {
  return node.parentNode ?? (node as Partial<ShadowRoot>).host ?? null;
}
