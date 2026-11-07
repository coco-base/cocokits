'use client';

import { isValidElement, useRef, type ReactElement, type Ref } from 'react';
import { trackActiveIndicator } from '@cocokits/cdk/active-indicator';
import { getTabsProps, tabsAnatomy } from '@cocokits/machines/tabs';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import { useTabsContext } from './tabs-context';
import type { TabsIndicatorProps, TabsPart, TabsRenderProps, TabsState } from './tabs.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function TabsIndicatorImpl({ render, ref, ...rest }: TabsIndicatorProps): ReactElement {
  const context = useTabsContext('Tabs.Indicator');
  const themeAttrs = useThemeAttrs(tabsAnatomy).indicator;
  const { indicator } = getTabsProps(context.state, context.dispatch);
  const indicatorRef = useRef<HTMLElement | null>(null);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, indicatorRef);

  // Read by the tracker, which is created once.
  const latest = useRef(context);
  useIsomorphicLayoutEffect(() => {
    latest.current = context;
  });

  // The list is the parent: the indicator is a direct child of it. The base writes the `--active-tab-*`
  // variables after mount and keeps them current while the list or any trigger resizes.
  const tracker = useRef<ReturnType<typeof trackActiveIndicator> | null>(null);
  useIsomorphicLayoutEffect(() => {
    const created = trackActiveIndicator({
      getList: () => indicatorRef.current?.parentElement ?? null,
      getItems: () => latest.current.getEntries().flatMap((entry) => (entry.element ? [entry.element] : [])),
      getActiveItem: () => {
        const selected = latest.current.selected;
        return selected === undefined ? null : (latest.current.getTrigger(selected) ?? null);
      },
      getIndicator: () => indicatorRef.current,
    });
    tracker.current = created;
    created.update();
    return () => {
      created.destroy();
      tracker.current = null;
    };
  }, []);
  useIsomorphicLayoutEffect(() => {
    tracker.current?.update();
  }, [context.selected, context.items, context.orientation]);

  const ours = { ...themeAttrs, ...toReactProps(indicator), ref: mergedRef };
  const props = mergeProps(ours, rest) as unknown as TabsRenderProps;
  return renderElement<TabsRenderProps, TabsState>(render, 'span', props, { orientation: context.orientation });
}

/**
 * Renders the decorative `<span>` that marks the selected tab. Place it as a direct child of `Tabs.List`, after the
 * triggers; without it no indicator is rendered. After mount the base writes `--active-tab-left`,
 * `--active-tab-top`, `--active-tab-width` and `--active-tab-height` on it, the box of the selected trigger inside
 * the list, and keeps them current when the list or any trigger resizes. Native `span` props pass through, and
 * `ref` reaches the element.
 *
 * @example
 * <Tabs.Indicator />
 * @cckPart indicator
 * @param props - The Indicator props.
 * @returns The rendered element.
 */
export const TabsIndicator: TabsPart<TabsIndicatorProps> = Object.assign(TabsIndicatorImpl, {
  displayName: 'Tabs.Indicator',
});
