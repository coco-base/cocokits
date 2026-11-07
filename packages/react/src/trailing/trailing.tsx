'use client';

import { cloneElement, isValidElement, type ReactElement, type Ref } from 'react';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { getTrailingProps, trailingAnatomy } from '@cocokits/machines/trailing';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import type { TrailingProps, TrailingRenderProps, TrailingState } from './trailing.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function TrailingImpl({ render, ref, children, ...rest }: TrailingProps): ReactElement {
  const parts = getTrailingProps();
  const themeAttrs = useThemeAttrs(trailingAnatomy);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const props = mergeProps(
    { ...themeAttrs.root, ...toReactProps(parts.root), ref: mergedRef, children },
    rest,
  ) as unknown as TrailingRenderProps;
  // The part's children win over the element's own: the Trailing renders the children it is given.
  const element = isValidElement<{ children?: undefined }>(render)
    ? cloneElement(render, { children: undefined })
    : render;
  return renderElement<TrailingRenderProps, TrailingState>(element, 'div', props, {});
}

/** The {@link Trailing} component and its `displayName`. */
interface TrailingComponent {
  (props: TrailingProps): ReactElement;
  displayName: string;
}

/**
 * Renders a `<div>` by default with content outside the box, after it. It is a plain wrapper: it adds no ARIA and
 * wires nothing, and its text is not part of the control's name or description. Give an icon
 * `aria-hidden="true"` and a button its own accessible name. Pass it to the `trailing` prop of a FormField to place it; it
 * also works outside a FormField. Native div attributes pass through, and `ref` reaches the div.
 *
 * @example
 * <FormField trailing={<Trailing>$</Trailing>} label={<Label>Price</Label>}>
 *   <Input />
 * </FormField>
 * @cckPart root
 * @param props - The Trailing props.
 * @returns The rendered div.
 */
export const Trailing: TrailingComponent = Object.assign(TrailingImpl, { displayName: 'Trailing' });
