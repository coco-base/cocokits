'use client';

import { isValidElement, useRef, type KeyboardEvent, type MouseEvent, type ReactElement, type Ref } from 'react';
import { getTabsProps, tabsAnatomy } from '@cocokits/machines/tabs';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { useElementKind } from '../internal/button-kind';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import { useTabsContext } from './tabs-context';
import type { TabsPart, TabsRenderProps, TabsTriggerProps, TabsTriggerState } from './tabs.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** The attributes that state the tab; a consumer value can never replace them. */
const RESERVED = [
  'id',
  'role',
  'aria-selected',
  'aria-controls',
  'tabIndex',
  'data-orientation',
  'data-selected',
  'data-disabled',
  'data-focus-visible',
];

function TabsTriggerImpl({
  value,
  disabled = false,
  nativeButton = true,
  render,
  ref,
  children,
  ...rest
}: TabsTriggerProps): ReactElement {
  const context = useTabsContext('Tabs.Trigger');
  const themeAttrs = useThemeAttrs(tabsAnatomy);
  const parts = getTabsProps(context.state, context.dispatch);
  const trigger = parts.trigger({ value, disabled });
  const machineProps = withoutReserved(
    toReactProps(trigger),
    nativeButton ? ['onClick'] : ['onClick', 'type', 'disabled'],
  );
  const internalRef = useRef<HTMLElement | null>(null);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useElementKind(
    'Tabs.Trigger',
    nativeButton,
    useMergedRef<HTMLElement>(ref, elementRef, internalRef),
  );

  // Read by the Root when it lists the tabs; the registration is made once.
  const latest = useRef({ value, disabled });
  useIsomorphicLayoutEffect(() => {
    latest.current = { value, disabled };
  });
  const { register, refresh } = context;
  useIsomorphicLayoutEffect(() => register(() => ({ ...latest.current, element: internalRef.current })), [register]);
  // A change of `value` or `disabled` renders only this trigger, so the Root lists the tabs again.
  useIsomorphicLayoutEffect(() => {
    refresh();
  }, [refresh, value, disabled]);

  const ours = {
    ...themeAttrs.trigger,
    ...machineProps,
    // A disabled non-native tab has no `disabled` attribute to stop the click, so it is stopped here.
    ...(!nativeButton && disabled ? { 'aria-disabled': 'true' } : {}),
    onClick: (event: MouseEvent<HTMLElement>) => {
      if (!nativeButton && disabled) return;
      trigger.onClick(event.nativeEvent);
    },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      // The list handles the arrow keys, Home and End. A native button clicks on Enter and Space; another
      // element selects the tab on keydown.
      if (nativeButton || event.defaultPrevented || event.target !== event.currentTarget) return;
      if (event.key === 'Enter' || event.key === ' ') {
        // A disabled tab selects nothing, but Space still must not scroll the page.
        if (!disabled) trigger.onClick(event.nativeEvent);
        event.preventDefault();
      }
    },
    onFocus: () => {
      context.focusTrigger(value);
    },
    onBlur: () => {
      context.blurTrigger();
    },
    ref: mergedRef,
  };
  const props = mergeProps(ours, {
    ...withoutReserved(rest, RESERVED),
    children: (
      <span {...themeAttrs.triggerLabel} className={parts.triggerLabel.class}>
        {children}
      </span>
    ),
  }) as unknown as TabsRenderProps;
  return renderElement<TabsRenderProps, TabsTriggerState>(render, 'button', props, {
    orientation: context.orientation,
    selected: trigger['aria-selected'] === 'true',
    disabled,
  });
}

/**
 * Renders a `<button role="tab" type="button">` that selects the panel with the same `value`. It carries
 * `aria-selected`, `aria-controls` and `data-selected`; only the selected tab is in the tab order, the others are
 * reached with the arrow keys (handled by `Tabs.List`). With `nativeButton={false}` it renders another element through `render`: no
 * `type`, Enter and Space select the tab on keydown, and a disabled tab gets `aria-disabled="true"` instead of
 * `disabled`. The children are wrapped in a label `<span>`. Native button props pass through, and
 * `ref` reaches the element. Compose it with another component through `render`.
 *
 * @example
 * <Tabs.Trigger value="account">Account</Tabs.Trigger>
 * @cckPart trigger
 * @cckPart triggerLabel
 * @param props - The Trigger props.
 * @returns The rendered element.
 */
export const TabsTrigger: TabsPart<TabsTriggerProps> = Object.assign(TabsTriggerImpl, {
  displayName: 'Tabs.Trigger',
});
