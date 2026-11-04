'use client';

import { cloneElement, isValidElement, type ReactElement, type Ref } from 'react';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { getLeadingProps, leadingAnatomy } from '@cocokits/machines/leading';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import type { LeadingProps, LeadingRenderProps, LeadingState } from './leading.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function LeadingImpl({ render, ref, children, ...rest }: LeadingProps): ReactElement {
  const parts = getLeadingProps();
  const themeAttrs = useThemeAttrs(leadingAnatomy);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const props = mergeProps(
    { ...themeAttrs.root, ...toReactProps(parts.root), ref: mergedRef, children },
    rest,
  ) as unknown as LeadingRenderProps;
  // The part's children win over the element's own: the Leading renders the children it is given.
  const element = isValidElement<{ children?: undefined }>(render)
    ? cloneElement(render, { children: undefined })
    : render;
  return renderElement<LeadingRenderProps, LeadingState>(element, 'div', props, {});
}

/** The {@link Leading} component and its `displayName`. */
interface LeadingComponent {
  (props: LeadingProps): ReactElement;
  displayName: string;
}

/**
 * Renders a `<div>` by default with content outside the box, before it. It is a plain wrapper: it adds no ARIA and
 * wires nothing, and its text is not part of the control's name or description. Give an icon
 * `aria-hidden="true"` and a button its own accessible name. Pass it to the `leading` prop of a FormField to place it; it
 * also works outside a FormField. Native div attributes pass through, and `ref` reaches the div.
 *
 * @example
 * <FormField leading={<Leading>$</Leading>} label={<Label>Price</Label>}>
 *   <Input />
 * </FormField>
 * @cckPart root
 * @param props - The Leading props.
 * @returns The rendered div.
 */
export const Leading: LeadingComponent = Object.assign(LeadingImpl, { displayName: 'Leading' });
