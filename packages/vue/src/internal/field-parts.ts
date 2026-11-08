import { Comment, Fragment, Text, cloneVNode, createVNode, isVNode, type VNode } from 'vue';

/** Whether a node is a part of the zone. A helper must not import a component, so the FormField passes it. */
export type IsPart = (node: VNode) => boolean;

/** A zone after reading: plain text wrapped in a part, and the `id` the author wrote on each part. */
export interface ReadZone {
  /** The nodes of the zone, each plain text replaced by a part. */
  readonly nodes: VNode[];
  /** One entry per part in document order: its `id`, or `undefined`. */
  readonly ownIds: (string | undefined)[];
  /**
   * Whether the zone holds anything that is not a part or plain text: an element, a wrapper or a custom component,
   * also one that renders a part itself. The field cannot see what a component renders, so it lists none of them.
   */
  readonly unlisted: boolean;
}

const idOf = (node: VNode): string | undefined => {
  const id: unknown = node.props?.id;
  return typeof id === 'string' && id !== '' ? id : undefined;
};

const childrenOf = (node: VNode): VNode[] =>
  Array.isArray(node.children) ? node.children.filter((child): child is VNode => isVNode(child)) : [];

/**
 * Reads a zone of a FormField (the `hint` or the `error` slot). Only the nodes `isPart` accepts are parts. A Fragment is read
 * through, and a plain text becomes a part, so it keeps describing the control. Any other node stays as it is, is
 * not read into and is not listed.
 *
 * @param nodes - The nodes of the slot.
 * @param isPart - Whether a node is a part: a Hint or a FieldError.
 * @param wrapText - The part that holds a plain text.
 * @returns The read zone.
 */
export function readZone(nodes: readonly VNode[], isPart: IsPart, wrapText: (text: string) => VNode): ReadZone {
  const ownIds: (string | undefined)[] = [];
  let unlisted = false;
  const walk = (zone: readonly VNode[]): VNode[] =>
    zone.map((node) => {
      if (node.type === Comment) return node;
      if (node.type === Fragment) {
        return createVNode(Fragment, { key: node.key ?? undefined }, walk(childrenOf(node)));
      }
      if (node.type === Text) {
        const text = typeof node.children === 'string' ? node.children : '';
        if (text.trim() === '') return node;
        ownIds.push(undefined);
        return wrapText(text);
      }
      if (isPart(node)) {
        ownIds.push(idOf(node));
        return node;
      }
      unlisted = true;
      return node;
    });
  return { nodes: walk(nodes), ownIds, unlisted };
}

/**
 * Gives each part of a read zone its id, in document order, unless the author wrote one. Because the ids come from
 * the slot, the first render (also on the server) already has them.
 *
 * @param nodes - The nodes of the read zone.
 * @param isPart - Whether a node is a part.
 * @param ids - The id of each part, from `formFieldIds`.
 * @returns The nodes with the ids set.
 */
export function withPartIds(nodes: readonly VNode[], isPart: IsPart, ids: readonly string[] | undefined): VNode[] {
  if (!ids || ids.length === 0) return [...nodes];
  let next = 0;
  const walk = (zone: readonly VNode[]): VNode[] =>
    zone.map((node) => {
      if (node.type === Fragment) return createVNode(Fragment, { key: node.key ?? undefined }, walk(childrenOf(node)));
      if (!isPart(node)) return node;
      const id = ids[next++];
      return idOf(node) === undefined ? cloneVNode(node, { id }) : node;
    });
  return walk(nodes);
}
