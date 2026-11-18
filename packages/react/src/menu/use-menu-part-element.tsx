'use client';

import { isValidElement, type ReactElement, type Ref } from 'react';
import { menuAnatomy } from '@cocokits/machines/menu';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps } from '../internal/merge-props';
import { renderElement, type RenderProp } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import type { MenuRenderProps, MenuState } from './menu.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** The anatomy parts that render a plain element made of the machine props and the theme attributes. */
export type MenuSimplePart =
  'itemLeading' | 'itemTrailing' | 'itemSupportingText' | 'itemShortcut' | 'itemIndicator' | 'group' | 'groupLabel';

/** What a simple part takes. */
export interface MenuPartElementProps {
  /** The author's `render`. */
  readonly render: RenderProp<MenuRenderProps, MenuState> | undefined;
  /** The author's `ref`. */
  readonly ref: Ref<HTMLElement> | undefined;
  /** The rest of the author's props. */
  readonly rest: Readonly<Record<string, unknown>>;
}

/**
 * The element of a part that has only machine props, the theme attributes and the author's props: the item
 * leading, trailing, supporting text and shortcut, the item indicator, the group and its label. Internal.
 *
 * @param part - The anatomy part, for the theme attributes.
 * @param tag - The element to render without `render`.
 * @param machine - The props of the machine for this part.
 * @param open - Whether the menu is open, for the state of `render`.
 * @param props - The author's `render`, `ref` and props.
 * @returns The rendered element.
 */
export function useMenuPartElement(
  part: MenuSimplePart,
  tag: 'span' | 'div',
  machine: object,
  open: boolean,
  props: MenuPartElementProps,
): ReactElement {
  const themeAttrs = useThemeAttrs(menuAnatomy)[part];
  const elementRef = isValidElement<ElementProps>(props.render) ? props.render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(props.ref, elementRef, undefined);
  const merged = mergeProps(
    { ...themeAttrs, ...toReactProps(machine), ref: mergedRef },
    props.rest,
  ) as unknown as MenuRenderProps;
  return renderElement<MenuRenderProps, MenuState>(props.render, tag, merged, { open });
}
