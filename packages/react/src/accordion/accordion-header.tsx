'use client';

import { isValidElement, type ReactElement, type Ref } from 'react';
import { accordionAnatomy } from '@cocokits/machines/accordion';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import { useAccordionContext, useAccordionItemContext } from './accordion-context';
import type { AccordionHeaderProps, AccordionItemState, AccordionPart, AccordionRenderProps } from './accordion.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

/** The attributes that state the item; a consumer value can never replace them. */
const RESERVED = ['data-state', 'data-disabled', 'data-orientation'];

function AccordionHeaderImpl({ render, ref, ...rest }: AccordionHeaderProps): ReactElement {
  const root = useAccordionContext('Accordion.Header');
  const item = useAccordionItemContext('Accordion.Header');
  const themeAttrs = useThemeAttrs(accordionAnatomy).header;
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const ours = { ...themeAttrs, ...toReactProps(item.parts.header), ref: mergedRef };
  const props = mergeProps(ours, withoutReserved(rest, RESERVED)) as unknown as AccordionRenderProps;
  return renderElement<AccordionRenderProps, AccordionItemState>(render, 'h3', props, {
    open: item.open,
    disabled: item.disabled,
    orientation: root.orientation,
  });
}

/**
 * Renders the `<h3>` heading of one item, which holds the trigger. Pick the level that fits the page outline with
 * `render`, for example `render={<h2 />}`. Native heading props pass through, and `ref` reaches the element.
 *
 * @example
 * <Accordion.Header render={<h2 />}>
 *   <Accordion.Trigger>Shipping</Accordion.Trigger>
 * </Accordion.Header>
 * @cckPart header
 * @param props - The Header props.
 * @returns The rendered element.
 */
export const AccordionHeader: AccordionPart<AccordionHeaderProps> = Object.assign(AccordionHeaderImpl, {
  displayName: 'Accordion.Header',
});
