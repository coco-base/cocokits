'use client';

import { isValidElement, type ReactElement, type Ref } from 'react';
import { getTooltipProps, tooltipAnatomy } from '@cocokits/machines/tooltip';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import { useTooltipContext } from './tooltip-context';
import type { TooltipRenderProps, TooltipState, TooltipTextProps } from './tooltip.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/**
 * The shared hook of `Tooltip.Title` and `Tooltip.Description`: a `<div>` with the class of the part and the theme
 * attributes, inside the content. Internal.
 *
 * @param part - Which part this is.
 * @param props - The part props.
 * @returns The rendered element.
 */
export function useTooltipTextPart(part: 'title' | 'description', props: TooltipTextProps): ReactElement {
  const { render, ref, ...rest } = props;
  const context = useTooltipContext(part === 'title' ? 'Tooltip.Title' : 'Tooltip.Description');
  const themeAttrs = useThemeAttrs(tooltipAnatomy)[part];
  const machineProps = getTooltipProps(
    { id: context.id, open: context.open, mounted: true, description: context.description },
    context.dispatch,
  )[part];
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const merged = mergeProps(
    { ...themeAttrs, ...toReactProps(machineProps), ref: mergedRef },
    rest,
  ) as unknown as TooltipRenderProps;
  return renderElement<TooltipRenderProps, TooltipState>(render, 'div', merged, { open: context.open });
}
