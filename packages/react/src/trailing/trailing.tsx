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
 * An icon, a short text or a button after the box of a field, outside it.
 * It renders a `<div>`. Native `div` props pass through, and `ref` reaches the element.
 *
 * Pass it to the `trailing` prop of a `FormField`, which puts it in its place. It also works outside a `FormField`.
 *
 * It adds no ARIA and links to nothing. Its text is not part of the name or the description of the control. Give
 * an icon `aria-hidden="true"`, and give a button its own accessible name.
 *
 * @example
 * <FormField label={<Label>Code</Label>} trailing={<Trailing>6 digits</Trailing>}>
 *   <Input />
 * </FormField>
 * @cckPart root
 * @param props - The Trailing props.
 * @returns The rendered div.
 */
export const Trailing: TrailingComponent = Object.assign(TrailingImpl, { displayName: 'Trailing' });
