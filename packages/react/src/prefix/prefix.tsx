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
 * An icon, a currency sign or a short text in the box of a field, before the control.
 * It renders a `<div>`. Native `div` props pass through, and `ref` reaches the element.
 *
 * Pass it to the `prefix` prop of a `FormField`, which puts it in its place. It also works outside a `FormField`.
 *
 * It adds no ARIA and links to nothing. Its text is not part of the name or the description of the control. An SVG
 * icon is hidden from screen readers by default; give your own `<svg>` `aria-hidden="true"`, and give a button its
 * own accessible name.
 *
 * @example
 * <FormField label={<Label>Price</Label>} prefix={<Prefix>$</Prefix>}>
 *   <Input type="number" />
 * </FormField>
 * @cckPart root
 * @param props - The Prefix props.
 * @returns The rendered div.
 */
export const Prefix: PrefixComponent = Object.assign(PrefixImpl, { displayName: 'Prefix' });
