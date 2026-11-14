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
 * A pointer from the content to the trigger. It renders a decorative `<span aria-hidden="true">` with a triangle
 * `<svg>`; put it inside `Tooltip.Content`.
 *
 * It sits on the edge of the content that faces the trigger, centered on the trigger and pointing at it. Its
 * height adds to the gap between the trigger and the content.
 *
 * It gets the native `hidden` attribute while it cannot point at the trigger, because the content has shifted.
 * Children replace the triangle.
 *
 * An element from `render` that is not an HTML element, such as an `<svg>`, does not hide with `hidden`. Hide it
 * with CSS.
 *
 * @example
 * <Tooltip.Content>
 *   Copy link
 *   <Tooltip.Arrow />
 * </Tooltip.Content>
 * @cckPart arrow
 * @param props - The Arrow props.
 * @returns The rendered element.
 */
export const TooltipArrow: TooltipPart<TooltipArrowProps> = Object.assign(TooltipArrowImpl, {
  displayName: 'Tooltip.Arrow',
});
