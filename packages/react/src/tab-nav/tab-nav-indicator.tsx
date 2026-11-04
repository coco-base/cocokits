'use client';

import { isValidElement, useRef, type ReactElement, type Ref } from 'react';
import { trackActiveIndicator } from '@cocokits/cdk/active-indicator';
import { getTabNavProps, tabNavAnatomy } from '@cocokits/machines/tab-nav';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import { useTabNavContext } from './tab-nav-context';
import type { TabNavIndicatorProps, TabNavPart, TabNavRenderProps, TabNavState } from './tab-nav.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function TabNavIndicatorImpl({ render, ref, ...rest }: TabNavIndicatorProps): ReactElement {
  const context = useTabNavContext('TabNav.Indicator');
  const themeAttrs = useThemeAttrs(tabNavAnatomy).indicator;
  const { indicator } = getTabNavProps({ panelId: context.panelId });
  const indicatorRef = useRef<HTMLElement | null>(null);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, indicatorRef);

  // Read by the tracker, which is created once.
  const latest = useRef(context);
  useIsomorphicLayoutEffect(() => {
    latest.current = context;
  });

  // The list is the parent: the indicator is a direct child of it. The base writes the `--active-tab-*`
  // variables after mount and keeps them current while the list or any link resizes.
  const tracker = useRef<ReturnType<typeof trackActiveIndicator> | null>(null);
  useIsomorphicLayoutEffect(() => {
    const created = trackActiveIndicator({
      getList: () => indicatorRef.current?.parentElement ?? null,
      getItems: () => latest.current.getEntries().flatMap((entry) => (entry.element ? [entry.element] : [])),
      getActiveItem: () => latest.current.getEntries().find((entry) => entry.active)?.element ?? null,
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
  }, [context.links]);

  const ours = { ...themeAttrs, ...toReactProps(indicator), ref: mergedRef };
  const props = mergeProps(ours, rest) as unknown as TabNavRenderProps;
  return renderElement<TabNavRenderProps, TabNavState>(render, 'span', props, {
    panelMode: context.panelId !== undefined,
  });
}

/**
 * Renders the decorative `<span>` that marks the active link. Place it as a direct child of `TabNav.List`, after
 * the links; without it no indicator is rendered. After mount the base writes `--active-tab-left`,
 * `--active-tab-top`, `--active-tab-width` and `--active-tab-height` on it, the box of the active link inside the
 * list, and keeps them current when the list or any link resizes. Native `span` props pass through, and `ref`
 * reaches the element.
 *
 * @example
 * <TabNav.Indicator />
 * @cckPart indicator
 * @param props - The Indicator props.
 * @returns The rendered element.
 */
export const TabNavIndicator: TabNavPart<TabNavIndicatorProps> = Object.assign(TabNavIndicatorImpl, {
  displayName: 'TabNav.Indicator',
});
