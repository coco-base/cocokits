import { Comment, Fragment, Text, cloneVNode, createVNode, isVNode, type VNode } from 'vue';

/** Whether a node is a part of the zone. A helper must not import a component, so the FormField passes it. */
export type IsPart = (node: VNode) => boolean;

/** A zone after reading: plain text wrapped in a part, and the `id` the author wrote on each part. */
export interface ReadZone {
  /** The nodes of the zone, each plain text replaced by a part. */
  readonly nodes: VNode[];
  /** One entry per part in document order: its `id`, or `undefined`. */
  readonly ownIds: (string | undefined)[];
  /** Whether a node that is not a part holds parts, or is a component the field cannot read into. */
  readonly wrapped: boolean;
}

const idOf = (node: VNode): string | undefined => {
  const id: unknown = node.props?.id;
  return typeof id === 'string' && id !== '' ? id : undefined;
};

const childrenOf = (node: VNode): VNode[] =>
  Array.isArray(node.children) ? node.children.filter((child): child is VNode => isVNode(child)) : [];

/** Whether an element holds a part anywhere in the vnodes it was written with. */
function holdsPart(node: VNode, isPart: IsPart): boolean {
  return childrenOf(node).some((child) => isPart(child) || holdsPart(child, isPart));
}

/**
 * Reads a zone of a FormField (the `hint` or the `error` slot). Only the nodes `isPart` accepts are parts. A Fragment is read
 * through, and a plain text becomes a part, so it keeps describing the control. Any other node stays as it is and
 * is not read into.
 *
 * @param nodes - The nodes of the slot.
 * @param isPart - Whether a node is a part: a Hint or a FieldError.
 * @param wrapText - The part that holds a plain text.
 * @returns The read zone.
 */
export function readZone(nodes: readonly VNode[], isPart: IsPart, wrapText: (text: string) => VNode): ReadZone {
  const ownIds: (string | undefined)[] = [];
  let wrapped = false;
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
      if (typeof node.type !== 'string' || holdsPart(node, isPart)) wrapped = true;
      return node;
    });
  return { nodes: walk(nodes), ownIds, wrapped };
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
