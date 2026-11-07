'use client';

import { cloneElement, isValidElement, type ReactElement, type Ref } from 'react';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { getSuffixProps, suffixAnatomy } from '@cocokits/machines/suffix';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import type { SuffixProps, SuffixRenderProps, SuffixState } from './suffix.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function SuffixImpl({ render, ref, children, ...rest }: SuffixProps): ReactElement {
  const parts = getSuffixProps();
  const themeAttrs = useThemeAttrs(suffixAnatomy);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const props = mergeProps(
    { ...themeAttrs.root, ...toReactProps(parts.root), ref: mergedRef, children },
    rest,
  ) as unknown as SuffixRenderProps;
  // The part's children win over the element's own: the Suffix renders the children it is given.
  const element = isValidElement<{ children?: undefined }>(render)
    ? cloneElement(render, { children: undefined })
    : render;
  return renderElement<SuffixRenderProps, SuffixState>(element, 'div', props, {});
}

/** The {@link Suffix} component and its `displayName`. */
interface SuffixComponent {
  (props: SuffixProps): ReactElement;
  displayName: string;
}

/**
 * Renders a `<div>` by default with content inside the box, after the control: a unit, an icon or a button. It is a plain wrapper: it adds no ARIA and
 * wires nothing, and its text is not part of the control's name or description. Give an icon
 * `aria-hidden="true"` and a button its own accessible name. Pass it to the `suffix` prop of a FormField to place it; it
 * also works outside a FormField. Native div attributes pass through, and `ref` reaches the div.
 *
 * @example
 * <FormField suffix={<Suffix>$</Suffix>} label={<Label>Price</Label>}>
 *   <Input />
 * </FormField>
 * @cckPart root
 * @param props - The Suffix props.
 * @returns The rendered div.
 */
export const Suffix: SuffixComponent = Object.assign(SuffixImpl, { displayName: 'Suffix' });
