'use client';

import { isValidElement, type ReactElement, type Ref } from 'react';
import { getTabsProps, tabsAnatomy } from '@cocokits/machines/tabs';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import { useTabsContext } from './tabs-context';
import type { TabsContentProps, TabsContentState, TabsPart, TabsRenderProps } from './tabs.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** The attributes that state the tab; a consumer value can never replace them. */
const RESERVED = ['id', 'role', 'aria-labelledby', 'tabIndex', 'hidden', 'data-orientation', 'data-selected'];

function TabsContentImpl({ value, forceMount, render, ref, children, ...rest }: TabsContentProps): ReactElement {
  const context = useTabsContext('Tabs.Content');
  const themeAttrs = useThemeAttrs(tabsAnatomy).panel;
  const parts = getTabsProps(context.state, context.dispatch);
  const panel = parts.panel({ value });
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const ours = { ...themeAttrs, ...toReactProps(panel), ref: mergedRef };
  const props = mergeProps(ours, {
    ...withoutReserved(rest, RESERVED),
    children: parts.hasContent({ value }, forceMount) ? children : undefined,
  }) as unknown as TabsRenderProps;
  return renderElement<TabsRenderProps, TabsContentState>(render, 'div', props, {
    orientation: context.orientation,
    selected: panel['data-selected'] !== undefined,
  });
}

/**
 * The panel of one tab. It renders a `<div role="tabpanel" tabindex="0">` that its trigger names with
 * `aria-labelledby`.
 *
 * The element is always rendered, so the `aria-controls` of the trigger points to it. It has the native `hidden`
 * attribute while its tab is not selected.
 *
 * The children render only while the tab is selected, or always with `forceMount`. Native `div` props pass
 * through, and `ref` reaches the element.
 *
 * @example
 * <Tabs.Content value="account">Change your name.</Tabs.Content>
 * @cckPart panel
 * @param props - The Content props.
 * @returns The rendered element.
 */
export const TabsContent: TabsPart<TabsContentProps> = Object.assign(TabsContentImpl, {
  displayName: 'Tabs.Content',
});
