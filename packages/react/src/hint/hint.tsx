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
 * A short help text under a control. It renders a `<div>` with no role. Native `div` props pass through, and `ref`
 * reaches the element.
 *
 * Pass it to the `hint` prop of a `FormField`, and it describes the control. A Hint without an `id` gets
 * `<fieldId>-hint-<n>`.
 *
 * Outside a `FormField`, it links to nothing by itself. Set an `id` on the Hint, and the same id in the
 * `aria-describedby` of the control.
 *
 * @example
 * <label htmlFor="email">Email</label>
 * <input id="email" type="email" aria-describedby="email-hint" />
 * <Hint id="email-hint">We only use it for the receipt.</Hint>
 * @cckPart root
 * @param props - The Hint props.
 * @returns The rendered div.
 */
export const Hint: HintComponent = Object.assign(HintImpl, { displayName: 'Hint' });
