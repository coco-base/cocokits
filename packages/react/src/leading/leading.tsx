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
 * An icon or a short text before the box of a field, outside it.
 * It renders a `<div>`. Native `div` props pass through, and `ref` reaches the element.
 *
 * Pass it to the `leading` prop of a `FormField`, which puts it in its place. It also works outside a `FormField`.
 *
 * It adds no ARIA and links to nothing. Its text is not part of the name or the description of the control. An SVG
 * icon is hidden from screen readers by default; give your own `<svg>` `aria-hidden="true"`, and give a button its
 * own accessible name.
 *
 * @example
 * <FormField label={<Label>Search</Label>} leading={<Leading aria-hidden="true">@</Leading>}>
 *   <Input type="search" />
 * </FormField>
 * @cckPart root
 * @param props - The Leading props.
 * @returns The rendered div.
 */
export const Leading: LeadingComponent = Object.assign(LeadingImpl, { displayName: 'Leading' });
