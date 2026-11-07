'use client';

import { cloneElement, isValidElement, type ReactElement, type Ref } from 'react';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { getHintProps, hintAnatomy } from '@cocokits/machines/hint';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import type { HintProps, HintRenderProps, HintState } from './hint.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function HintImpl({ render, ref, children, ...rest }: HintProps): ReactElement {
  const parts = getHintProps();
  const themeAttrs = useThemeAttrs(hintAnatomy);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  const props = mergeProps(
    { ...themeAttrs.root, ...toReactProps(parts.root), ref: mergedRef, children },
    rest,
  ) as unknown as HintRenderProps;
  // The part's children win over the element's own: the Hint renders the children it is given.
  const element = isValidElement<{ children?: undefined }>(render)
    ? cloneElement(render, { children: undefined })
    : render;
  return renderElement<HintRenderProps, HintState>(element, 'div', props, {});
}

/** The {@link Hint} component and its `displayName`. */
interface HintComponent {
  (props: HintProps): ReactElement;
  displayName: string;
}

/**
 * Renders a `<div>` by default with a short help text under a control. It has no role and
 * wires nothing: the author sets `id` on the Hint and `aria-describedby` with that id on the
 * control. It works the same outside a FormField. Native div attributes pass through, and `ref`
 * reaches the div.
 *
 * @example
 * <Hint id="email-hint">We only use it for the receipt.</Hint>
 * @cckPart root
 * @param props - The Hint props.
 * @returns The rendered div.
 */
export const Hint: HintComponent = Object.assign(HintImpl, { displayName: 'Hint' });
