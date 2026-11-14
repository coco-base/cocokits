/**
 * Checks whether a node is a shadow root.
 *
 * @remarks
 * It checks the node type and the `host` property instead of using `instanceof ShadowRoot`. So it works across
 * realms, such as an iframe, and it needs no global on a server.
 *
 * @param node - The node to test. `null` is not a shadow root.
 * @returns `true` for a shadow root. TypeScript then narrows the node to `ShadowRoot`.
 * @example
 * const root = document.querySelector('#host')!.getRootNode();
 * if (isShadowRoot(root)) console.log(root.host.localName);
 */
export function isShadowRoot(node: Node | null): node is ShadowRoot {
  return node !== null && node.nodeType === 11 && 'host' in node;
}
