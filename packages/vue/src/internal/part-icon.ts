import { computed, Comment, Fragment, h, Text, type ComputedRef, type VNode } from 'vue';
import { useThemeIcons } from '@cocokits/vue-core';
import { SvgIcon } from '../svg-icon';

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
 * The name of the icon the provided theme gives a part of a component, from `partIconNames`. Call it in `setup`.
 *
 * @internal
 * @param block - The anatomy block of the component, never a literal name.
 * @param part - The name of the part.
 * @returns A computed with the icon name, or `undefined` when there is no theme or the theme names none.
 */
export function usePartIconName(block: string, part: string): ComputedRef<string | undefined> {
  const icons = useThemeIcons();
  return computed(() => {
    const byBlock: Readonly<Partial<Record<string, Readonly<Record<string, string>>>>> = icons.value.partIconNames;
    const names = byBlock[block];
    return names?.[part];
  });
}

/**
 * What a part that holds an icon renders inside itself: the author's content when there is any, else the theme's
 * icon through the SvgIcon when the part shows it, else nothing.
 *
 * @internal
 * @param content - What the default slot returned, or `undefined` when no slot was given.
 * @param iconName - The icon of the theme for the part, or `undefined`.
 * @param shown - Whether the state of the part shows the icon.
 * @returns The nodes to render.
 */
export function partIconNodes(content: VNode[] | undefined, iconName: string | undefined, shown = true): VNode[] {
  if (iconName === undefined || !shown || !isEmptyContent(content)) return content ?? [];
  return [h(SvgIcon, { iconName })];
}

/** Renders nodes made in the part's own render, so a changed slot or state re-renders them. @internal */
export const Nodes = (nodeProps: { nodes: VNode[] }): VNode[] => nodeProps.nodes;
