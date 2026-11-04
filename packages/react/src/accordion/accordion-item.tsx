'use client';

import { isValidElement, useId, useRef, useState, type ReactElement, type Ref } from 'react';
import { createPresence, type Presence } from '@cocokits/cdk/presence';
import { writeContentSize } from '@cocokits/cdk/content-size';
import { accordionAnatomy, accordionContentSizeVariables, getAccordionItemProps } from '@cocokits/machines/accordion';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import { AccordionItemContext, useAccordionContext, type AccordionItemContextValue } from './accordion-context';
import type { AccordionItemProps, AccordionItemState, AccordionPart, AccordionRenderProps } from './accordion.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** The attributes that state the item; a consumer value can never replace them. */
const RESERVED = ['data-state', 'data-disabled', 'data-orientation'];

function AccordionItemImpl({
  value,
  disabled = false,
  render,
  ref,
  children,
  ...rest
}: AccordionItemProps): ReactElement {
  const context = useAccordionContext('Accordion.Item');
  const id = useId();
  const themeAttrs = useThemeAttrs(accordionAnatomy).item;
  const { state, register } = context;
  const open = state.value.includes(value);
  const itemRef = useRef<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLElement | null>(null);
  const [forceMounted, setForceMounted] = useState(false);
  // The content stays in the document after the item closes until its exit animation has finished.
  const [exited, setExited] = useState(!open);
  const present = open || !exited;

  // Read by the Root when it lists the items; the registration is made once.
  const latest = useRef({ value, disabled });
  useIsomorphicLayoutEffect(() => {
    latest.current = { value, disabled };
  });
  useIsomorphicLayoutEffect(
    () =>
      register(() => ({
        ...latest.current,
        element: itemRef.current,
        trigger: triggerRef.current,
        content: contentRef.current,
      })),
    [register],
  );

  // The size is written when the open state changes after mount, never on the first render, so an item that is
  // open at first render shows at full height with no animation.
  const previousOpen = useRef(open);
  useIsomorphicLayoutEffect(() => {
    if (previousOpen.current === open) return;
    previousOpen.current = open;
    if (contentRef.current) writeContentSize(contentRef.current, accordionContentSizeVariables);
  }, [open]);

  const presence = useRef<Presence | null>(null);
  useIsomorphicLayoutEffect(() => {
    const created = createPresence({
      getElement: () => contentRef.current,
      onStateChange: (next) => {
        setExited(next === 'unmounted');
      },
    });
    presence.current = created;
    return () => {
      created.destroy();
      presence.current = null;
    };
  }, []);
  // After the closed state is rendered, so the exit animation already exists when it is read.
  useIsomorphicLayoutEffect(() => {
    presence.current?.setOpen(open);
  }, [open]);

  const parts = getAccordionItemProps(
    state,
    { id, key: value, disabled, contentMounted: present || forceMounted, contentPresent: present },
    context.dispatch,
  );
  const itemDisabled = parts.trigger.disabled === true;
  // Built on every render: `parts` changes with the state of the Root, and so does everything below it.
  const itemContext: AccordionItemContextValue = {
    parts,
    open,
    disabled: itemDisabled,
    value,
    present,
    triggerRef,
    contentRef,
    setForceMounted,
  };

  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, itemRef);
  const ours = { ...themeAttrs, ...toReactProps(parts.item), ref: mergedRef };
  const props = mergeProps(ours, { ...withoutReserved(rest, RESERVED), children }) as unknown as AccordionRenderProps;
  return (
    <AccordionItemContext.Provider value={itemContext}>
      {renderElement<AccordionRenderProps, AccordionItemState>(render, 'div', props, {
        open,
        disabled: itemDisabled,
        orientation: context.orientation,
      })}
    </AccordionItemContext.Provider>
  );
}

/**
 * Renders the `<div>` of one section: its header and its content. `value` is the key of the item in the open
 * value. A disabled item cannot be toggled by the user, and the arrow keys skip it. Native `div` props pass
 * through, and `ref` reaches the element.
 *
 * @example
 * <Accordion.Item value="shipping">
 *   <Accordion.Header>
 *     <Accordion.Trigger>Shipping</Accordion.Trigger>
 *   </Accordion.Header>
 *   <Accordion.Content>Orders leave in two days.</Accordion.Content>
 * </Accordion.Item>
 * @cckPart item
 * @param props - The Item props.
 * @returns The rendered element inside the provider.
 */
export const AccordionItem: AccordionPart<AccordionItemProps> = Object.assign(AccordionItemImpl, {
  displayName: 'Accordion.Item',
});
