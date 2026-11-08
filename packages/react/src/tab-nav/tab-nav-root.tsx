'use client';

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { getTabNavProps, resolveTabNavStop, tabNavAnatomy } from '@cocokits/machines/tab-nav';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { hasAccessibleName, sortByDomOrder } from '@cocokits/utils';
import { isDevelopment } from '../internal/dev';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import {
  TabNavContext,
  type TabNavContextValue,
  type TabNavListedLink,
  type TabNavRegistration,
} from './tab-nav-context';
import { TabNavLink } from './tab-nav-link';
import type { TabNavPart, TabNavRenderProps, TabNavRootProps, TabNavState } from './tab-nav.types';

const sameLinks = (a: readonly TabNavListedLink[], b: readonly TabNavListedLink[]): boolean =>
  a.length === b.length &&
  a.every((link, index) => {
    const other = b.at(index);
    return link.key === other?.key && link.active === other.active && link.disabled === other.disabled;
  });

interface ChildProps {
  readonly children?: ReactNode;
  readonly active?: boolean;
}

/**
 * Whether the children hold an active `TabNav.Link`: `true` if one is, `false` if the links found are all
 * inactive, `undefined` when none is found (a link inside another component is not seen).
 */
function findActiveLink(children: ReactNode): boolean | undefined {
  let found: boolean | undefined;
  for (const child of Children.toArray(children)) {
    if (!isValidElement<ChildProps>(child)) continue;
    if (child.type === TabNavLink) {
      if (child.props.active === true) return true;
      found = false;
    } else {
      const inner = findActiveLink(child.props.children);
      if (inner === true) return true;
      if (inner === false) found = false;
    }
  }
  return found;
}

function TabNavRootImpl({ tabPanel, render, ref, children, ...rest }: TabNavRootProps): ReactElement {
  const themeAttrs = useThemeAttrs(tabNavAnatomy);
  const parts = getTabNavProps({ panelId: tabPanel });
  const rootRef = useRef<HTMLElement | null>(null);
  const mergedRef = useMergedRef<HTMLElement>(ref, undefined, rootRef);
  const registry = useRef(new Set<() => TabNavRegistration>());
  const [links, setLinks] = useState<readonly TabNavListedLink[] | null>(null);
  // The render-order claim of the Tab stop; it belongs to this instance, so nothing leaks between requests.
  const claimed = useRef<string | undefined>(undefined);
  const sawActive = tabPanel === undefined ? undefined : findActiveLink(children);

  const getEntries = useCallback((): readonly TabNavRegistration[] => {
    const entries = [...registry.current].map((read) => read());
    const byElement = new Map(entries.flatMap((entry) => (entry.element ? [[entry.element, entry] as const] : [])));
    return sortByDomOrder([...byElement.keys()]).flatMap((element) => byElement.get(element) ?? []);
  }, []);

  // The links in document order. Set only when it differs, so it never loops.
  const refresh = useCallback((): void => {
    const next = getEntries().map(({ key, active, disabled }) => ({ key, active, disabled }));
    setLinks((previous) => (previous !== null && sameLinks(previous, next) ? previous : next));
  }, [getEntries]);

  const register = useCallback(
    (read: () => TabNavRegistration): (() => void) => {
      registry.current.add(read);
      refresh();
      return () => {
        registry.current.delete(read);
        refresh();
      };
    },
    [refresh],
  );

  const claim = useCallback(
    (key: string, active: boolean, disabled: boolean): boolean => {
      if (disabled) return false;
      if (active) {
        claimed.current = key;
        return true;
      }
      if (sawActive === true) return false;
      claimed.current ??= key;
      return claimed.current === key;
    },
    [claimed, sawActive],
  );

  // After every commit: a moved link changes no state the root tracks.
  useIsomorphicLayoutEffect(() => {
    refresh();
  });

  const stop = useMemo((): string | null | undefined => {
    if (links === null) return undefined;
    return links[resolveTabNavStop(links)]?.key ?? null;
  }, [links]);

  const context = useMemo<TabNavContextValue>(
    () => ({ panelId: tabPanel, register, refresh, getEntries, links, stop, claim }),
    [tabPanel, register, refresh, getEntries, links, stop, claim],
  );

  useEffect(() => {
    if (!isDevelopment()) return;
    if (rootRef.current && !hasAccessibleName(rootRef.current)) {
      console.warn('CocoKits: <TabNav.Root> has no accessible name. Add an aria-label or aria-labelledby.');
    }
  }, []);

  const ours = { ...themeAttrs.root, ...toReactProps(parts.root), ref: mergedRef };
  const props = mergeProps(ours, { ...rest, children }) as unknown as TabNavRenderProps;
  return (
    <TabNavContext.Provider value={context}>
      {renderElement<TabNavRenderProps, TabNavState>(render, 'nav', props, { panelMode: tabPanel !== undefined })}
    </TabNavContext.Provider>
  );
}

/**
 * Links to pages that look like a row of tabs. It renders a `<nav>` landmark around the list of links; name it with
 * `aria-label` or `aria-labelledby`.
 *
 * Each link goes to a page, so the links stay links. Give `tabPanel` the id of a `TabNav.Panel` for panel mode.
 * The list then is a `tablist`, and the links are tabs with one Tab stop and the arrow keys.
 *
 * Native `nav` props pass through, and `ref` reaches the element.
 *
 * @example
 * <TabNav.Root aria-label="Project" tabPanel="project-panel">
 *   <TabNav.List>
 *     <TabNav.Link href="/overview" active>Overview</TabNav.Link>
 *     <TabNav.Link href="/activity">Activity</TabNav.Link>
 *     <TabNav.Indicator />
 *   </TabNav.List>
 * </TabNav.Root>
 * <TabNav.Panel id="project-panel">The page of the active link.</TabNav.Panel>
 * @cckPart root
 * @param props - The Root props.
 * @returns The rendered element inside the provider.
 */
export const TabNavRoot: TabNavPart<TabNavRootProps> = Object.assign(TabNavRootImpl, {
  displayName: 'TabNav.Root',
});
