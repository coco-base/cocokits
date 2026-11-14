'use client';

import { isValidElement, useEffect, useMemo, useRef, type KeyboardEvent, type ReactElement, type Ref } from 'react';
import { scrollItemIntoList } from '@cocokits/cdk/active-indicator';
import { createRovingFocus } from '@cocokits/cdk/roving-focus';
import { getTabsProps, tabsAnatomy } from '@cocokits/machines/tabs';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import { useTabsContext } from './tabs-context';
import type { TabsListProps, TabsPart, TabsRenderProps, TabsState } from './tabs.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function TabsListImpl({ render, loop = true, ref, onKeyDown, ...rest }: TabsListProps): ReactElement {
  const context = useTabsContext('Tabs.List');
  const themeAttrs = useThemeAttrs(tabsAnatomy);
  const { list } = getTabsProps(context.state, context.dispatch);
  const listRef = useRef<HTMLElement | null>(null);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, listRef);

  // The roving focus reads the stable getters of the Root; a new one is made when a setting changes.
  const { orientation, getEntries, dispatch } = context;
  const dir = context.state.dir ?? 'ltr';
  const roving = useMemo(
    () =>
      createRovingFocus({
        getItems: () =>
          getEntries().flatMap((entry) =>
            entry.element ? [{ element: entry.element, disabled: entry.disabled }] : [],
          ),
        strategy: 'focus',
        orientation,
        loop,
        getDirection: () => dir,
        // The key target is always a trigger, which gives the current index.
        getCurrentIndex: () => -1,
        onActiveChange: (index, { event }) => {
          const entry = getEntries().at(index);
          if (!entry) return;
          const list = entry.element?.closest(`.${tabsAnatomy.classes.list}`);
          if (list instanceof HTMLElement && entry.element) scrollItemIntoList(list, entry.element);
          dispatch({ type: 'TRIGGER.NAVIGATE', value: entry.value, event });
        },
      }),
    [orientation, loop, dir, getEntries, dispatch],
  );

  // A selection after the first render brings the selected tab fully into view; only the list scrolls.
  const { selected, getTrigger } = context;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const trigger = selected === undefined ? undefined : getTrigger(selected);
    if (listRef.current && trigger) scrollItemIntoList(listRef.current, trigger);
  }, [selected, getTrigger]);

  const ours = {
    ...themeAttrs.list,
    ...toReactProps(list),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      // Shift+arrow is the browser's or the page's (a selection, a gesture): not a tab move.
      if (!event.shiftKey) roving.handleKeyDown(event.nativeEvent);
    },
    ref: mergedRef,
  };
  const props = mergeProps(ours, { ...rest, onKeyDown }) as unknown as TabsRenderProps;
  return renderElement<TabsRenderProps, TabsState>(render, 'div', props, { orientation: context.orientation });
}

/**
 * The row of tabs. It renders a `<div role="tablist">` that holds the triggers and the `Tabs.Indicator`. Name it
 * with `aria-label` or `aria-labelledby`.
 *
 * The arrow keys, Home and End move the focus between the enabled triggers. In `rtl`, Left and Right swap. The
 * arrow keys wrap unless `loop` is `false`, and in `automatic` mode they select the focused tab.
 *
 * When the list overflows, it scrolls the selected or focused tab into view. Only the list scrolls. Native `div`
 * props pass through, and `ref` reaches the element.
 *
 * @example
 * <Tabs.List aria-label="Account settings">
 *   <Tabs.Trigger value="account">Account</Tabs.Trigger>
 *   <Tabs.Indicator />
 * </Tabs.List>
 * @cckPart list
 * @param props - The List props.
 * @returns The rendered element.
 */
export const TabsList: TabsPart<TabsListProps> = Object.assign(TabsListImpl, {
  displayName: 'Tabs.List',
});
