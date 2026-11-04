'use client';

import { isValidElement, type ReactElement, type Ref } from 'react';
import { getTooltipProps, tooltipAnatomy } from '@cocokits/machines/tooltip';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps } from '../internal/merge-props';
import { OverlayArrowTriangle, useOverlayArrowContext } from '../internal/overlay-arrow';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import { useTooltipContext } from './tooltip-context';
import type { TooltipArrowProps, TooltipPart, TooltipRenderProps, TooltipState } from './tooltip.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function TooltipArrowImpl({ render, ref, children, ...rest }: TooltipArrowProps): ReactElement {
  const context = useTooltipContext('Tooltip.Arrow');
  const arrow = useOverlayArrowContext('Tooltip.Arrow', 'Tooltip.Content');
  const themeAttrs = useThemeAttrs(tooltipAnatomy).arrow;
  const { arrow: machineProps } = getTooltipProps(
    {
      id: context.id,
      open: context.open,
      mounted: true,
      description: context.description,
      arrowHidden: arrow.hidden,
    },
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
  const props = mergeProps(ours, rest) as unknown as TooltipRenderProps;
  return renderElement<TooltipRenderProps, TooltipState>(render, 'span', props, { open: context.open });
}

/**
 * Renders the pointer from the content to the trigger: a decorative `<span aria-hidden="true">` that holds a
 * triangle `<svg>`. Put it inside `Tooltip.Content`. CocoKits places it on the content edge that faces the
 * trigger, centred on the trigger and turned to point at it, and adds its height to the gap between the trigger
 * and the content. It gets the native `hidden` attribute while it cannot point at the trigger (the content has
 * shifted along the edge). Children replace the triangle. An element chosen with `render` that is not an HTML
 * element, such as an `<svg>`, is not hidden by `hidden`: hide it with CSS.
 *
 * @example
 * <Tooltip.Content>Copy link<Tooltip.Arrow /></Tooltip.Content>
 * @cckPart arrow
 * @param props - The Arrow props.
 * @returns The rendered element.
 */
export const TooltipArrow: TooltipPart<TooltipArrowProps> = Object.assign(TooltipArrowImpl, {
  displayName: 'Tooltip.Arrow',
});
