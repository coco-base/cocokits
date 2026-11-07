'use client';

import { cloneElement, isValidElement, type ReactElement, type Ref } from 'react';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { getPrefixProps, prefixAnatomy } from '@cocokits/machines/prefix';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import type { PrefixProps, PrefixRenderProps, PrefixState } from './prefix.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function PrefixImpl({ render, ref, children, ...rest }: PrefixProps): ReactElement {
  const parts = getPrefixProps();
  const themeAttrs = useThemeAttrs(prefixAnatomy);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const props = mergeProps(
    { ...themeAttrs.root, ...toReactProps(parts.root), ref: mergedRef, children },
    rest,
  ) as unknown as PrefixRenderProps;
  // The part's children win over the element's own: the Prefix renders the children it is given.
  const element = isValidElement<{ children?: undefined }>(render)
    ? cloneElement(render, { children: undefined })
    : render;
  return renderElement<PrefixRenderProps, PrefixState>(element, 'div', props, {});
}

/** The {@link Prefix} component and its `displayName`. */
interface PrefixComponent {
  (props: PrefixProps): ReactElement;
  displayName: string;
}

/**
 * Renders a `<div>` by default with content inside the box, before the control: an icon, a currency sign or a short text. It is a plain wrapper: it adds no ARIA and
 * wires nothing, and its text is not part of the control's name or description. Give an icon
 * `aria-hidden="true"` and a button its own accessible name. Pass it to the `prefix` prop of a FormField to place it; it
 * also works outside a FormField. Native div attributes pass through, and `ref` reaches the div.
 *
 * @example
 * <FormField prefix={<Prefix>$</Prefix>} label={<Label>Price</Label>}>
 *   <Input />
 * </FormField>
 * @cckPart root
 * @param props - The Prefix props.
 * @returns The rendered div.
 */
export const Prefix: PrefixComponent = Object.assign(PrefixImpl, { displayName: 'Prefix' });
