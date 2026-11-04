/**
 * Whether a node is a shadow root. It checks the node type and the `host` property instead of
 * `instanceof ShadowRoot`, so it works across realms (an iframe) and needs no global on the server.
 *
 * @param node - The node to test; `null` is not a shadow root.
 * @returns `true` for a shadow root.
 */
export function isShadowRoot(node: Node | null): node is ShadowRoot {
  return node !== null && node.nodeType === 11 && 'host' in node;
}
