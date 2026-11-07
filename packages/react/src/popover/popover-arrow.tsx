'use client';

import { isValidElement, type ReactElement, type Ref } from 'react';
import { getPopoverProps, popoverAnatomy } from '@cocokits/machines/popover';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps } from '../internal/merge-props';
import { OverlayArrowTriangle, useOverlayArrowContext } from '../internal/overlay-arrow';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import { usePopoverContext } from './popover-context';
import type { PopoverArrowProps, PopoverPart, PopoverRenderProps, PopoverState } from './popover.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function PopoverArrowImpl({ render, ref, children, ...rest }: PopoverArrowProps): ReactElement {
  const context = usePopoverContext('Popover.Arrow');
  const arrow = useOverlayArrowContext('Popover.Arrow', 'Popover.Content');
  const themeAttrs = useThemeAttrs(popoverAnatomy).arrow;
  const { arrow: machineProps } = getPopoverProps(
    { id: context.id, open: context.open, mounted: true, arrowHidden: arrow.hidden },
    context.dispatch,
  );
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, arrow.setElement);

  const ours = {
    ...themeAttrs,
    ...toReactProps(machineProps),
    ref: mergedRef,
    children: children === undefined ? <OverlayArrowTriangle /> : children,
  };
  const props = mergeProps(ours, rest) as unknown as PopoverRenderProps;
  return renderElement<PopoverRenderProps, PopoverState>(render, 'span', props, { open: context.open });
}

/**
 * Renders the pointer from the content to the trigger: a decorative `<span aria-hidden="true">` that holds a
 * triangle `<svg>`. Put it inside `Popover.Content`. CocoKits places it on the content edge that faces the
 * trigger, centred on the trigger and turned to point at it, and adds its height to the gap between the trigger
 * and the content. It gets the native `hidden` attribute while it cannot point at the trigger (the content has
 * shifted along the edge). Children replace the triangle. An element chosen with `render` that is not an HTML
 * element, such as an `<svg>`, is not hidden by `hidden`: hide it with CSS.
 *
 * @example
 * <Popover.Content aria-label="Share"><Popover.Arrow />Anyone with the link can view.</Popover.Content>
 * @cckPart arrow
 * @param props - The Arrow props.
 * @returns The rendered element.
 */
export const PopoverArrow: PopoverPart<PopoverArrowProps> = Object.assign(PopoverArrowImpl, {
  displayName: 'Popover.Arrow',
});
