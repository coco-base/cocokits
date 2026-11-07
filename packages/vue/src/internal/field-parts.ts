import { Comment, Fragment, Text, cloneVNode, createVNode, type VNode } from 'vue';

/** The vnodes of a zone that are parts, in document order; a Fragment is looked through. */
function partsOf(nodes: readonly VNode[]): VNode[] {
  return nodes.flatMap((node) => {
    if (node.type === Comment) return [];
    if (node.type === Text) return [];
    if (node.type === Fragment) return partsOf(Array.isArray(node.children) ? (node.children as VNode[]) : []);
    return [node];
  });
}

const idOf = (node: VNode): string | undefined => {
  const id: unknown = node.props?.id;
  return typeof id === 'string' && id !== '' ? id : undefined;
};

/**
 * Reads the `id` the author wrote on each part of a zone (the `hint` or the `error` slot of a FormField).
 *
 * @param nodes - The nodes of the slot.
 * @returns One entry per part in document order: its `id`, or `undefined`.
 */
export function ownPartIds(nodes: readonly VNode[]): (string | undefined)[] {
  return partsOf(nodes).map(idOf);
}

/**
 * Gives each part of a zone its id, in document order, unless the author wrote one. Because the ids come from the
 * slot, the first render (also on the server) already has them.
 *
 * @param nodes - The nodes of the slot.
 * @param ids - The id of each part, from `formFieldIds`.
 * @returns The nodes with the ids set.
 */
export function withPartIds(nodes: readonly VNode[], ids: readonly string[] | undefined): VNode[] {
  if (!ids || ids.length === 0) return [...nodes];
  let next = 0;
  const walk = (zone: readonly VNode[]): VNode[] =>
    zone.map((node) => {
      if (node.type === Comment || node.type === Text) return node;
      if (node.type === Fragment) {
        return Array.isArray(node.children)
          ? createVNode(Fragment, { key: node.key ?? undefined }, walk(node.children as VNode[]))
          : node;
      }
      const id = ids[next++];
      return idOf(node) === undefined ? cloneVNode(node, { id }) : node;
    });
  return walk(nodes);
}
