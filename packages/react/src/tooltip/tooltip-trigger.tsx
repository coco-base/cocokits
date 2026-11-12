'use client';

import { isValidElement, type FocusEvent, type PointerEvent, type ReactElement, type Ref } from 'react';
import { getTooltipProps, tooltipAnatomy } from '@cocokits/machines/tooltip';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { useElementKind } from '../internal/button-kind';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMergedRef } from '../internal/use-merged-ref';
import { useTooltipContext } from './tooltip-context';
import type { TooltipPart, TooltipRenderProps, TooltipState, TooltipTriggerProps } from './tooltip.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** The attributes that state the tooltip; a consumer value can never replace them. */
const RESERVED = ['data-state'];

/** The handlers the machine owns; they are re-created below with the native event. */
const HANDLERS = ['onPointerEnter', 'onPointerLeave', 'onPointerDown', 'onFocus', 'onBlur'];

function TooltipTriggerImpl({ render, nativeButton = true, ref, ...rest }: TooltipTriggerProps): ReactElement {
  const context = useTooltipContext('Tooltip.Trigger');
  const themeAttrs = useThemeAttrs(tooltipAnatomy).trigger;
  const { trigger } = getTooltipProps(
    {
      id: context.id,
      open: context.open,
      mounted: context.mounted,
      disabled: context.disabled,
      description: context.description,
      isFocusVisible: context.isFocusVisible,
    },
    context.dispatch,
  );
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useElementKind(
    'Tooltip.Trigger',
    nativeButton,
    useMergedRef<HTMLElement>(ref, elementRef, context.setTrigger),
  );
  // A description equal to this label adds nothing, so the Root needs to know it.
  const label = (rest as { 'aria-label'?: string })['aria-label'];
  const { setTriggerLabel } = context;
  useIsomorphicLayoutEffect(() => {
    setTriggerLabel(label);
  }, [label, setTriggerLabel]);
  // The tooltip adds its description or content id to the author's own description.
  const consumerIds = (rest as { 'aria-describedby'?: string })['aria-describedby'];
  const describedBy = [consumerIds, trigger['aria-describedby']].filter(Boolean).join(' ') || undefined;

  const ours = {
    ...themeAttrs,
    ...withoutReserved(toReactProps(trigger), HANDLERS),
    ...(nativeButton ? { type: 'button' } : { tabIndex: 0 }),
    'aria-describedby': describedBy,
    onPointerEnter: (event: PointerEvent<HTMLElement>) => {
      trigger.onPointerEnter(event.nativeEvent);
    },
    onPointerLeave: (event: PointerEvent<HTMLElement>) => {
      trigger.onPointerLeave(event.nativeEvent);
    },
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      trigger.onPointerDown(event.nativeEvent);
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      trigger.onFocus(event.nativeEvent);
    },
    onBlur: (event: FocusEvent<HTMLElement>) => {
      trigger.onBlur(event.nativeEvent);
    },
    ref: mergedRef,
  };
  const props = mergeProps(
    ours,
    withoutReserved(rest, [...RESERVED, 'aria-describedby']),
  ) as unknown as TooltipRenderProps;
  return renderElement<TooltipRenderProps, TooltipState>(render, 'button', props, { open: context.open });
}

/**
 * The element that the tooltip describes. It renders a `<button type="button">`. Native button props pass through,
 * and `ref` reaches the element.
 *
 * A trigger with only an icon needs `aria-label` or `aria-labelledby`. Its name must not come from the tooltip.
 *
 * Its `aria-describedby` adds the tooltip to any ids you wrote. It points to a hidden copy of the text of the
 * Content after hydration, or to the content while it is mounted.
 *
 * Hover and keyboard focus show the tooltip, and a press hides it. To render another element or component, use
 * `render` and `nativeButton={false}`.
 *
 * A disabled button cannot take the focus, so it never shows the tooltip. Make a wrapper the trigger with
 * `render={<span />}` and `nativeButton={false}`, and put the button inside it.
 *
 * @example
 * <Tooltip.Trigger aria-label="Copy link">
 *   <svg aria-hidden="true">...</svg>
 * </Tooltip.Trigger>
 * @cckPart trigger
 * @param props - The Trigger props.
 * @returns The rendered element.
 */
export const TooltipTrigger: TooltipPart<TooltipTriggerProps> = Object.assign(TooltipTriggerImpl, {
  displayName: 'Tooltip.Trigger',
});
