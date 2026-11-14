'use client';

import { isValidElement, useCallback, useId, useMemo, useRef, useState, type ReactElement, type Ref } from 'react';
import { trackFocusVisible, type FocusVisibleTracker } from '@cocokits/cdk/focus';
import {
  getTabsProps,
  resolveSelectedTab,
  tabsAnatomy,
  transitionTabs,
  type TabsEvent,
  type TabsItem,
  type TabsValue,
  type TabsState as MachineState,
} from '@cocokits/machines/tabs';
import { DirectionProvider, toReactProps, useDirection, useThemeAttrs } from '@cocokits/react-core';
import { sortByDomOrder } from '@cocokits/utils';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useControllableState } from '../internal/use-controllable-state';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import { TabsContext, type TabsContextValue, type TabsRegistration } from './tabs-context';
import type { TabsChangeDetails, TabsPart, TabsRenderProps, TabsRootProps, TabsState } from './tabs.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

interface Latest {
  readonly machineState: MachineState;
  readonly setValue: (value: string, details: TabsChangeDetails) => void;
  readonly getTrigger: (value: string) => HTMLElement | undefined;
}

/** The values of this adapter are strings; the machine also allows numbers. */
const textOf = (value: TabsValue | undefined): string | undefined => (typeof value === 'string' ? value : undefined);

/** The Root renders no handler, so the props it computes need no `send`. */
const ignore = (): void => undefined;

const sameItems = (a: readonly TabsItem[], b: readonly TabsItem[]): boolean =>
  a.length === b.length &&
  a.every((item, index) => item.value === b[index]?.value && item.disabled === b[index]?.disabled);

function TabsRootImpl({
  value: valueProp,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  activationMode = 'automatic',
  dir: dirProp,
  render,
  ref,
  children,
  ...rest
}: TabsRootProps): ReactElement {
  const id = useId();
  const inherited = useDirection();
  const dir = dirProp ?? inherited;
  const themeAttrs = useThemeAttrs(tabsAnatomy).root;
  const [value, setValue] = useControllableState<string | undefined, TabsChangeDetails>({
    value: valueProp,
    defaultValue,
    onChange: (next, details) => {
      if (next !== undefined) onValueChange?.(next, details);
    },
    name: '<Tabs.Root value>',
  });
  const [items, setItems] = useState<readonly TabsItem[]>([]);
  // The first resolved value, kept once so the selection never moves on its own (a disabled first tab).
  const [pinned, setPinned] = useState<string | undefined>(undefined);
  const [focusVisibleValue, setFocusVisibleValue] = useState<string | undefined>(undefined);
  const registry = useRef(new Set<() => TabsRegistration>());
  const tracker = useRef<FocusVisibleTracker | null>(null);

  const current = value ?? pinned;
  const selected = textOf(resolveSelectedTab(items, current));
  const machineState = useMemo<MachineState>(
    () => ({ id, items, value: current, orientation, activationMode, dir, focusVisibleValue }),
    [id, items, current, orientation, activationMode, dir, focusVisibleValue],
  );

  const getTrigger = useCallback((target: string): HTMLElement | undefined => {
    for (const read of registry.current) {
      const registration = read();
      if (registration.value === target) return registration.element ?? undefined;
    }
    return undefined;
  }, []);

  // The registered triggers in document order.
  const getEntries = useCallback((): readonly TabsRegistration[] => {
    const registrations = [...registry.current].map((read) => read());
    const byElement = new Map(
      registrations.flatMap((entry) => (entry.element ? [[entry.element, entry] as const] : [])),
    );
    return sortByDomOrder([...byElement.keys()]).flatMap((element) => byElement.get(element) ?? []);
  }, []);

  // The tabs list, set only when it differs, so it never loops.
  const refresh = useCallback((): void => {
    const next = getEntries().map((entry): TabsItem => ({ value: entry.value, disabled: entry.disabled }));
    setItems((previous) => (sameItems(previous, next) ? previous : next));
  }, [getEntries]);

  const register = useCallback(
    (read: () => TabsRegistration): (() => void) => {
      registry.current.add(read);
      refresh();
      return () => {
        registry.current.delete(read);
        refresh();
      };
    },
    [refresh],
  );

  // After every commit: a moved or re-enabled trigger changes no state the root tracks.
  useIsomorphicLayoutEffect(() => {
    refresh();
    if (value !== undefined) return;
    if (pinned === undefined) {
      if (selected !== undefined) setPinned(selected);
    } else if (items.length > 0 && !items.some((item) => item.value === pinned)) {
      // Every trigger the pin named is gone: the first enabled trigger of the new set is selected.
      setPinned(textOf(items.find((item) => !item.disabled)?.value));
    }
  });

  useIsomorphicLayoutEffect(() => {
    tracker.current = trackFocusVisible(document);
    return () => {
      tracker.current?.destroy();
      tracker.current = null;
    };
  }, []);

  // Read by `dispatch`, which the handlers of the parts call.
  const latest = useRef<Latest>({ machineState, setValue, getTrigger });
  useIsomorphicLayoutEffect(() => {
    latest.current = { machineState, setValue, getTrigger };
  });

  const dispatch = useCallback((event: TabsEvent): void => {
    const state = latest.current;
    const result = transitionTabs(state.machineState, event);
    const select = textOf(result.select);
    const focus = textOf(result.focus);
    if (select !== undefined) state.setValue(select, { reason: 'user', event: event.event });
    if (focus !== undefined) state.getTrigger(focus)?.focus();
  }, []);

  const focusTrigger = useCallback((target: string): void => {
    setFocusVisibleValue(tracker.current?.isFocusVisible() ? target : undefined);
  }, []);
  const blurTrigger = useCallback((): void => {
    setFocusVisibleValue(undefined);
  }, []);

  const context = useMemo<TabsContextValue>(
    () => ({
      state: machineState,
      dispatch,
      selected,
      orientation,
      activationMode,
      register,
      getTrigger,
      focusTrigger,
      blurTrigger,
      getEntries,
      items,
      refresh,
    }),
    [
      machineState,
      dispatch,
      selected,
      orientation,
      activationMode,
      register,
      getTrigger,
      focusTrigger,
      blurTrigger,
      getEntries,
      items,
      refresh,
    ],
  );

  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const ours = { ...themeAttrs, ...toReactProps(getTabsProps(machineState, ignore).root), ref: mergedRef };
  // Only the author's own `dir` is rendered; keys, placement and nested parts use the resolved one.
  const props = mergeProps(ours, { ...rest, dir: dirProp, children }) as unknown as TabsRenderProps;
  return (
    <DirectionProvider dir={dir}>
      <TabsContext.Provider value={context}>
        {renderElement<TabsRenderProps, TabsState>(render, 'div', props, { orientation })}
      </TabsContext.Provider>
    </DirectionProvider>
  );
}

/**
 * Panels of content that show one at a time, picked by a row of tabs. It renders a `<div>` and gives the selected
 * value to the list, the triggers and the panels.
 *
 * Control the value with `value` and `onValueChange`, or set `defaultValue` and let the tabs keep it.
 *
 * On the list, the arrow keys, Home and End move between the enabled triggers. With `automatic` activation, the
 * focused tab is selected; with `manual`, Enter or Space selects it.
 *
 * Native `div` props pass through, and `ref` reaches the element.
 *
 * @example
 * <Tabs.Root defaultValue="account">
 *   <Tabs.List aria-label="Account settings">
 *     <Tabs.Trigger value="account">Account</Tabs.Trigger>
 *     <Tabs.Trigger value="password">Password</Tabs.Trigger>
 *     <Tabs.Indicator />
 *   </Tabs.List>
 *   <Tabs.Content value="account">Change your name.</Tabs.Content>
 *   <Tabs.Content value="password">Change your password.</Tabs.Content>
 * </Tabs.Root>
 * @cckPart root
 * @param props - The Root props.
 * @returns The rendered element inside the provider.
 */
export const TabsRoot: TabsPart<TabsRootProps> = Object.assign(TabsRootImpl, {
  displayName: 'Tabs.Root',
});
