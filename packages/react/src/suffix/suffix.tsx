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
 * A unit, an icon or a button in the box of a field, after the control.
 * It renders a `<div>`. Native `div` props pass through, and `ref` reaches the element.
 *
 * Pass it to the `suffix` prop of a `FormField`, which puts it in its place. It also works outside a `FormField`.
 *
 * It adds no ARIA and links to nothing. Its text is not part of the name or the description of the control. Give
 * an icon `aria-hidden="true"`, and give a button its own accessible name.
 *
 * @example
 * <FormField label={<Label>Weight</Label>} suffix={<Suffix>kg</Suffix>}>
 *   <Input type="number" />
 * </FormField>
 * @cckPart root
 * @param props - The Suffix props.
 * @returns The rendered div.
 */
export const Suffix: SuffixComponent = Object.assign(SuffixImpl, { displayName: 'Suffix' });
