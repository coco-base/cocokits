'use client';

import { isValidElement, useId, useRef, type KeyboardEvent, type ReactElement, type Ref } from 'react';
import { getTabNavProps, tabNavAnatomy } from '@cocokits/machines/tab-nav';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import { useTabNavContext } from './tab-nav-context';
import type { TabNavLinkProps, TabNavLinkState, TabNavPart, TabNavRenderProps } from './tab-nav.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** The attributes that state the link; a consumer value can never replace them. */
const RESERVED = ['aria-current', 'aria-disabled', 'data-active', 'data-disabled'];
/** What panel mode adds: the tab roles and the Tab stop. */
const PANEL_RESERVED = ['role', 'aria-selected', 'aria-controls', 'tabIndex'];

function TabNavLinkImpl({
  active = false,
  disabled = false,
  id,
  render,
  ref,
  children,
  ...rest
}: TabNavLinkProps): ReactElement {
  const context = useTabNavContext('TabNav.Link');
  const { panelId, register, refresh, stop, claim } = context;
  const panelMode = panelId !== undefined;
  const key = useId();
  const themeAttrs = useThemeAttrs(tabNavAnatomy).link;
  // After mount the Root resolves the one Tab stop over the registered links; before it, the render-order claim.
  const tabStop = panelMode && (stop === undefined ? claim(key, active, disabled) : stop === key);
  const { onClick: guard, ...machineProps } = toReactProps(
    getTabNavProps({ panelId }).link({ active, disabled, id, tabStop }),
  );
  const node = useRef<HTMLElement | null>(null);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, node);

  // Read by the Root when it lists the links; the registration is made once.
  const latest = useRef({ key, active, disabled });
  useIsomorphicLayoutEffect(() => {
    latest.current = { key, active, disabled };
  });
  useIsomorphicLayoutEffect(() => register(() => ({ ...latest.current, element: node.current })), [register]);
  // A change of `active` or `disabled` renders only this link, so the Root lists the links again.
  useIsomorphicLayoutEffect(() => {
    refresh();
  }, [refresh, active, disabled]);

  // The guard is the capture-phase handler: it runs before any native listener of the element (a router's
  // included) and stops the click. A consumer `onClickCapture` runs first and may veto it with `preventDefault()`.
  const ours = {
    ...themeAttrs,
    ...machineProps,
    ...(guard ? { onClickCapture: guard } : {}),
    // Space activates a tab link and must not scroll the page; a button does that natively.
    ...(panelMode
      ? {
          onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
            const element = event.currentTarget;
            if (event.key !== ' ' || event.target !== element || element.tagName === 'BUTTON') return;
            event.preventDefault();
            if (!disabled) element.click();
          },
        }
      : {}),
    ref: mergedRef,
  };
  const props = mergeProps(ours, {
    ...withoutReserved(rest, panelMode ? [...RESERVED, ...PANEL_RESERVED] : RESERVED),
    // In link mode the author's `id` is the element's own; in panel mode the machine decides it.
    ...(panelMode ? {} : { id }),
    children,
  }) as unknown as TabNavRenderProps;
  return renderElement<TabNavRenderProps, TabNavLinkState>(render, 'a', props, { active, disabled });
}

/**
 * Renders an `<a>` that goes to a page, or a router link through `render={<Link to="/" />}`. The current page's
 * link has `active`: it renders `aria-current="page"` and `data-active`, and the indicator moves to it. A disabled
 * link renders `aria-disabled="true"` and `tabindex="-1"`, and its activation is blocked in the capture phase,
 * before any other click listener of the element. In link mode there are no tab roles and no roving focus: Tab
 * moves between the links and Enter follows one. When the Root has a `tabPanel` the link is a `tab`
 * (`aria-selected`, `aria-controls`, no `aria-current`) and the one Tab stop: the active link, else the first
 * enabled one; the arrow keys, Home and End move focus (never navigate) and Space activates it. The active link
 * gets the id `<panel id>-tab` unless you pass an `id`. Native `a` props pass through, and `ref` reaches the
 * element.
 *
 * @example
 * <TabNav.Link href="/overview" active>Overview</TabNav.Link>
 * @cckPart link
 * @param props - The Link props.
 * @returns The rendered element.
 */
export const TabNavLink: TabNavPart<TabNavLinkProps> = Object.assign(TabNavLinkImpl, {
  displayName: 'TabNav.Link',
});
