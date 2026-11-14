'use client';

import { isValidElement, type MouseEvent, type ReactElement, type Ref } from 'react';
import { popoverAnatomy, getPopoverProps } from '@cocokits/machines/popover';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { nonNativeButtonProps, useElementKind } from '../internal/button-kind';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import { usePopoverContext } from './popover-context';
import type { PopoverPart, PopoverRenderProps, PopoverState, PopoverTriggerProps } from './popover.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** The attributes that state the open state; a consumer value can never replace them. */
const RESERVED = ['aria-expanded', 'aria-controls', 'aria-haspopup', 'data-state'];

function PopoverTriggerImpl({ render, nativeButton = true, ref, ...rest }: PopoverTriggerProps): ReactElement {
  const context = usePopoverContext('Popover.Trigger');
  const themeAttrs = useThemeAttrs(popoverAnatomy).trigger;
  const { trigger } = getPopoverProps(
    { id: context.id, open: context.open, mounted: context.mounted },
    context.dispatch,
  );
  const machineProps = withoutReserved(toReactProps(trigger), nativeButton ? ['onClick'] : ['onClick', 'type']);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useElementKind(
    'Popover.Trigger',
    nativeButton,
    useMergedRef<HTMLElement>(ref, elementRef, context.setTrigger),
  );

  const ours = {
    ...themeAttrs,
    ...machineProps,
    ...(nativeButton ? {} : nonNativeButtonProps()),
    onClick: (event: MouseEvent<HTMLElement>) => {
      trigger.onClick(event.nativeEvent);
    },
    ref: mergedRef,
  };
  const props = mergeProps(ours, withoutReserved(rest, RESERVED)) as unknown as PopoverRenderProps;
  return renderElement<PopoverRenderProps, PopoverState>(render, 'button', props, { open: context.open });
}

/**
 * The button that opens and closes the popover. It renders a `<button type="button">` with `aria-haspopup="dialog"`
 * and `aria-expanded`. Native button props pass through, and `ref` reaches the element.
 *
 * It has `aria-controls` while the content is mounted.
 *
 * To render another element or component, use `render`. An element that is not a `<button>` also needs
 * `nativeButton={false}`.
 *
 * @example
 * <Popover.Trigger>Share</Popover.Trigger>
 * @cckPart trigger
 * @param props - The Trigger props.
 * @returns The rendered element.
 */
export const PopoverTrigger: PopoverPart<PopoverTriggerProps> = Object.assign(PopoverTriggerImpl, {
  displayName: 'Popover.Trigger',
});
