'use client';

import { isValidElement, useCallback, useMemo, useRef, useState, type ReactElement, type Ref } from 'react';
import { deepActiveElement, trackFocusVisible, type FocusVisibleTracker } from '@cocokits/cdk/focus';
import {
  accordionAnatomy,
  getAccordionProps,
  transitionAccordion,
  type AccordionEvent,
  type AccordionItem,
  type AccordionState as MachineState,
} from '@cocokits/machines/accordion';
import { DirectionProvider, toReactProps, useDirection, useThemeAttrs } from '@cocokits/react-core';
import { containsDeep, sortByDomOrder } from '@cocokits/utils';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useControllableState } from '../internal/use-controllable-state';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import { AccordionContext, type AccordionContextValue, type AccordionRegistration } from './accordion-context';
import type {
  AccordionChangeDetails,
  AccordionPart,
  AccordionRenderProps,
  AccordionRootProps,
  AccordionState,
} from './accordion.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

type OpenValue = string | readonly string[];

interface Latest {
  readonly machineState: MachineState;
  readonly setValue: (value: OpenValue, details: AccordionChangeDetails) => void;
  readonly getTrigger: (value: string) => HTMLElement | undefined;
  readonly multiple: boolean;
}

/** The attributes that state the accordion; a consumer value can never replace them. */
const RESERVED = ['data-orientation', 'data-disabled', 'data-multiple'];

const NONE: readonly string[] = [];

const sameItems = (a: readonly AccordionItem[], b: readonly AccordionItem[]): boolean =>
  a.length === b.length && a.every((item, index) => item.key === b[index]?.key && item.disabled === b[index]?.disabled);

const sameKeys = (a: readonly string[], b: readonly string[]): boolean =>
  a.length === b.length && a.every((key, index) => key === b[index]);

/** The open keys of the value prop: a single value is one key (`''` is none), a multiple value is the list. */
function toKeys(value: OpenValue, multiple: boolean): readonly string[] {
  if (multiple) return typeof value === 'string' ? NONE : value;
  return typeof value === 'string' && value !== '' ? [value] : NONE;
}

function AccordionRootImpl({
  type,
  value: valueProp,
  defaultValue,
  onValueChange,
  collapsible = false,
  disabled = false,
  orientation = 'vertical',
  dir: dirProp,
  render,
  ref,
  children,
  ...rest
}: AccordionRootProps & { readonly collapsible?: boolean | undefined }): ReactElement {
  const multiple = type === 'multiple';
  const inherited = useDirection();
  const dir = dirProp ?? inherited;
  const themeAttrs = useThemeAttrs(accordionAnatomy).root;
  const [value, setValue] = useControllableState<OpenValue, AccordionChangeDetails>({
    value: valueProp,
    defaultValue: defaultValue ?? (multiple ? NONE : ''),
    onChange: (next, details) => {
      (onValueChange as ((value: OpenValue, details: AccordionChangeDetails) => void) | undefined)?.(next, details);
    },
    name: '<Accordion.Root value>',
  });
  const keys = useMemo(() => toKeys(value, multiple), [value, multiple]);
  const [items, setItems] = useState<readonly AccordionItem[]>([]);
  const [focusVisibleKey, setFocusVisibleKey] = useState<string | undefined>(undefined);
  const registry = useRef(new Set<() => AccordionRegistration>());
  const tracker = useRef<FocusVisibleTracker | null>(null);

  const machineState = useMemo<MachineState>(
    () => ({ items, value: keys, type, collapsible, disabled, orientation, dir, focusVisibleKey }),
    [items, keys, type, collapsible, disabled, orientation, dir, focusVisibleKey],
  );

  const getTrigger = useCallback((target: string): HTMLElement | undefined => {
    for (const read of registry.current) {
      const registration = read();
      if (registration.value === target) return registration.trigger ?? undefined;
    }
    return undefined;
  }, []);

  // The registered items in document order. Set only when it differs, so it never loops.
  const refresh = useCallback((): void => {
    const registrations = [...registry.current].map((read) => read());
    const byElement = new Map(
      registrations.flatMap((entry) => (entry.element ? [[entry.element, entry] as const] : [])),
    );
    const ordered = sortByDomOrder([...byElement.keys()]).flatMap((element) => byElement.get(element) ?? []);
    const next = ordered.map((entry): AccordionItem => ({ key: entry.value, disabled: entry.disabled }));
    setItems((previous) => (sameItems(previous, next) ? previous : next));
  }, []);

  const register = useCallback(
    (read: () => AccordionRegistration): (() => void) => {
      registry.current.add(read);
      refresh();
      return () => {
        registry.current.delete(read);
        refresh();
      };
    },
    [refresh],
  );

  // After every commit: a moved item changes no state the root tracks.
  useIsomorphicLayoutEffect(() => {
    refresh();
  });

  useIsomorphicLayoutEffect(() => {
    tracker.current = trackFocusVisible(document);
    return () => {
      tracker.current?.destroy();
      tracker.current = null;
    };
  }, []);

  // Read by `dispatch`, which the handlers of the parts call.
  const latest = useRef<Latest>({ machineState, setValue, getTrigger, multiple });
  useIsomorphicLayoutEffect(() => {
    latest.current = { machineState, setValue, getTrigger, multiple };
  });

  const dispatch = useCallback((event: AccordionEvent): void => {
    const state = latest.current;
    const result = transitionAccordion(state.machineState, event);
    if (result.value !== undefined) {
      const next: OpenValue = state.multiple ? result.value : (result.value[0] ?? '');
      state.setValue(next, { reason: 'user', event: 'event' in event ? event.event : null });
    }
    if (result.focus !== undefined) state.getTrigger(result.focus)?.focus();
  }, []);

  // When items close, by any cause (a click or the parent writing `value`), and focus is inside the content of one,
  // the machine names the trigger to focus. This runs after the commit that renders the closed state and before
  // the content is hidden or removed, which waits for the presence of the item.
  const previousKeys = useRef(keys);
  useIsomorphicLayoutEffect(() => {
    const before = previousKeys.current;
    previousKeys.current = keys;
    if (sameKeys(before, keys)) return;
    const active = deepActiveElement(document);
    if (active === null) return;
    const held = [...registry.current]
      .map((read) => read())
      .find((entry) => before.includes(entry.value) && entry.content && containsDeep(entry.content, active));
    if (held === undefined) return;
    const result = transitionAccordion(
      { ...machineState, value: before, focusInContent: held.value },
      { type: 'VALUE.SYNC', value: keys },
    );
    if (result.focus !== undefined) getTrigger(result.focus)?.focus();
  });

  const focusTrigger = useCallback((target: string): void => {
    setFocusVisibleKey(tracker.current?.isFocusVisible() ? target : undefined);
  }, []);
  const blurTrigger = useCallback((): void => {
    setFocusVisibleKey(undefined);
  }, []);

  const context = useMemo<AccordionContextValue>(
    () => ({ state: machineState, dispatch, orientation, register, getTrigger, focusTrigger, blurTrigger }),
    [machineState, dispatch, orientation, register, getTrigger, focusTrigger, blurTrigger],
  );

  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const ours = { ...themeAttrs, ...toReactProps(getAccordionProps(machineState)), ref: mergedRef };
  // Only the author's own `dir` is rendered; keys and nested parts use the resolved one.
  const props = mergeProps(ours, {
    ...withoutReserved(rest, RESERVED),
    dir: dirProp,
    children,
  }) as unknown as AccordionRenderProps;
  return (
    <DirectionProvider dir={dir}>
      <AccordionContext.Provider value={context}>
        {renderElement<AccordionRenderProps, AccordionState>(render, 'div', props, { orientation })}
      </AccordionContext.Provider>
    </DirectionProvider>
  );
}

/**
 * A stack of sections that the user opens and closes. It renders a `<div>` and gives the open value to its items.
 * With `type="single"` at most one item is open; with `type="multiple"` each item opens on its own.
 *
 * Control the open value with `value` and `onValueChange`, or set `defaultValue` and let the accordion keep it. A
 * single accordion closes its open item again only with `collapsible`.
 *
 * The arrow keys, Home and End move between the enabled triggers. When an item closes while the focus is in its
 * content, the focus moves to its trigger. Native `div` props pass through, and `ref` reaches the element.
 *
 * @example
 * <Accordion.Root type="single" collapsible defaultValue="shipping">
 *   <Accordion.Item value="shipping">
 *     <Accordion.Header>
 *       <Accordion.Trigger>Shipping</Accordion.Trigger>
 *     </Accordion.Header>
 *     <Accordion.Content>Orders leave in two days.</Accordion.Content>
 *   </Accordion.Item>
 *   <Accordion.Item value="returns">
 *     <Accordion.Header>
 *       <Accordion.Trigger>Returns</Accordion.Trigger>
 *     </Accordion.Header>
 *     <Accordion.Content>You can return an item within 30 days.</Accordion.Content>
 *   </Accordion.Item>
 * </Accordion.Root>
 * @cckPart root
 * @param props - The Root props.
 * @returns The rendered element inside the provider.
 */
export const AccordionRoot: AccordionPart<AccordionRootProps> = Object.assign(AccordionRootImpl, {
  displayName: 'Accordion.Root',
});
