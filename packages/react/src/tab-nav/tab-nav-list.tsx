'use client';

import { isValidElement, useMemo, type KeyboardEvent, type ReactElement, type Ref } from 'react';
import { scrollItemIntoList } from '@cocokits/cdk/active-indicator';
import { createRovingFocus } from '@cocokits/cdk/roving-focus';
import { getTabNavProps, tabNavAnatomy } from '@cocokits/machines/tab-nav';
import { toReactProps, useDirection, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import { useTabNavContext } from './tab-nav-context';
import type { TabNavListProps, TabNavPart, TabNavRenderProps, TabNavState } from './tab-nav.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function TabNavListImpl({ render, ref, onKeyDown, ...rest }: TabNavListProps): ReactElement {
  const context = useTabNavContext('TabNav.List');
  const themeAttrs = useThemeAttrs(tabNavAnatomy).list;
  const dir = useDirection();
  const { list } = getTabNavProps({ panelId: context.panelId });
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);

  // Panel mode only: the arrow keys, Home and End move focus between the enabled links and never navigate.
  const { getEntries } = context;
  const roving = useMemo(
    () =>
      createRovingFocus({
        getItems: () =>
          getEntries().flatMap((entry) =>
            entry.element ? [{ element: entry.element, disabled: entry.disabled }] : [],
          ),
        strategy: 'focus',
        orientation: 'horizontal',
        loop: true,
        getDirection: () => dir,
        // The key target is always a link, which gives the current index.
        getCurrentIndex: () => -1,
        onActiveChange: (index) => {
          const element = getEntries().at(index)?.element;
          const list = element?.closest(`.${tabNavAnatomy.classes.list}`);
          if (list instanceof HTMLElement && element) scrollItemIntoList(list, element);
        },
      }),
    [dir, getEntries],
  );
  const panelMode = context.panelId !== undefined;

  const ours = {
    ...themeAttrs,
    ...toReactProps(list),
    ...(panelMode
      ? {
          onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
            if (!event.shiftKey) roving.handleKeyDown(event.nativeEvent);
          },
        }
      : {}),
    ref: mergedRef,
  };
  const props = mergeProps(ours, { ...rest, onKeyDown }) as unknown as TabNavRenderProps;
  return renderElement<TabNavRenderProps, TabNavState>(render, 'div', props, { panelMode });
}

/**
 * Renders the `<div>` list inside the `TabNav.Root` that holds the links and the `TabNav.Indicator` as direct
 * children. With a `tabPanel` on the Root it is the `tablist`; without one it has no role. In panel mode the arrow
 * keys, Home and End move focus between the enabled links, wrapping and flipped in right-to-left, and scroll the
 * link into view when the list overflows. Native `div` props pass through, and `ref` reaches the element.
 *
 * @example
 * <TabNav.List>
 *   <TabNav.Link href="/overview" active>Overview</TabNav.Link>
 * </TabNav.List>
 * @cckPart list
 * @param props - The List props.
 * @returns The rendered element.
 */
export const TabNavList: TabNavPart<TabNavListProps> = Object.assign(TabNavListImpl, {
  displayName: 'TabNav.List',
});
