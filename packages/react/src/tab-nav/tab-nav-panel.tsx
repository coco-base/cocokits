'use client';

import { isValidElement, useEffect, type ReactElement, type Ref } from 'react';
import { getTabNavProps, tabNavAnatomy } from '@cocokits/machines/tab-nav';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { isDevelopment } from '../internal/dev';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import type { TabNavPanelProps, TabNavPart, TabNavRenderProps, TabNavState } from './tab-nav.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** The attributes that state the panel; a consumer value can never replace them (`aria-labelledby` may be replaced). */
const RESERVED = ['role', 'tabIndex'];

function TabNavPanelImpl({ id, hasActiveLink = true, render, ref, children, ...rest }: TabNavPanelProps): ReactElement {
  const themeAttrs = useThemeAttrs(tabNavAnatomy).panel;
  const panel = getTabNavProps({ panelId: id }).panel({ id, hasActiveLink });
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const ours = { ...themeAttrs, ...toReactProps(panel), ref: mergedRef };
  const props = mergeProps(ours, { ...withoutReserved(rest, RESERVED), children });
  const labelledBy = props['aria-labelledby'];

  // After mount: the label must point at an element of the page, or the author forgot `hasActiveLink`.
  useEffect(() => {
    if (!isDevelopment() || typeof labelledBy !== 'string') return;
    if (!labelledBy.split(/\s+/).every((target) => document.getElementById(target) !== null)) {
      console.warn(
        `CocoKits: <TabNav.Panel id="${id}"> is labelled by "${labelledBy}", which matches no element. ` +
          'Set hasActiveLink={false} while no link is active, or give the active link that id.',
      );
    }
  }, [id, labelledBy]);

  return renderElement<TabNavRenderProps, TabNavState>(render, 'div', props as unknown as TabNavRenderProps, {
    panelMode: true,
  });
}

/**
 * Renders the `<div role="tabpanel">` that the links of a `TabNav.Root` with `tabPanel` drive, usually around a
 * router outlet. It may sit anywhere in the page. It is reachable with Tab (`tabindex="0"`) and labelled by the
 * active link (`aria-labelledby="<id>-tab"`) while `hasActiveLink` is `true`; an `aria-labelledby` you pass wins.
 * Native `div` props pass through, and `ref` reaches the element.
 *
 * @example
 * <TabNav.Panel id="project-panel">The routed page.</TabNav.Panel>
 * @cckPart panel
 * @param props - The Panel props.
 * @returns The rendered element.
 */
export const TabNavPanel: TabNavPart<TabNavPanelProps> = Object.assign(TabNavPanelImpl, {
  displayName: 'TabNav.Panel',
});
