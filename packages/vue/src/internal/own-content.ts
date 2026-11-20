import { Comment, Fragment, Text, type VNode } from 'vue';

/**
 * Whether the nodes of a default slot hold no content: no slot, comments, and text that is empty or only white
 * space. Fragments (a `v-for`, a `v-if` chain) count by what they hold. Any other node, an element, a component or
 * text with a character that is not white space, is content.
 *
 * @internal
 * @param nodes - What the default slot returned, or `undefined` when no slot was given.
 * @returns `true` when there is no content.
 */
export function isEmptyContent(nodes: readonly unknown[] | undefined): boolean {
  return (nodes ?? []).every((node) => {
    if (typeof node === 'string') return node.trim() === '';
    if (node === null || node === undefined || typeof node === 'boolean') return true;
    const vnode = node as VNode;
    if (vnode.type === Comment) return true;
    if (vnode.type === Text) return (typeof vnode.children === 'string' ? vnode.children : '').trim() === '';
    if (vnode.type === Fragment) return isEmptyContent(vnode.children as readonly unknown[] | undefined);
    return false;
  });
}

/**
 * What a part that holds an icon renders inside itself: the author's content when there is any, else the icon of
 * the part (the theme's, else the default) when the part shows it, else nothing. The part builds the icon with its
 * own `SvgIcon`.
 *
 * @internal
 * @param content - What the default slot (or the child of `asChild`) holds, or `undefined` when there is none.
 * @param icon - The icon node to show when there is no content, or `undefined` when the part shows none.
 * @returns The nodes to render.
 */
export function partIconNodes(content: VNode[] | undefined, icon: VNode | undefined): VNode[] {
  return icon === undefined || !isEmptyContent(content) ? (content ?? []) : [icon];
}

/** Renders nodes made in the part's own render, so a changed slot or state re-renders them. @internal */
export const Nodes = (nodeProps: { nodes: VNode[] }): VNode[] => nodeProps.nodes;
