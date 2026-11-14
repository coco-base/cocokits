'use client';

import { cloneElement, isValidElement, type ReactElement, type Ref } from 'react';
import { toReactProps, useThemeAttrs } from '@cocokits/react-core';
import { fieldErrorAnatomy, getFieldErrorProps } from '@cocokits/machines/field-error';
import { useFormFieldState } from '../internal/form-field-context';
import { mergeProps } from '../internal/merge-props';
import { renderElement } from '../internal/render-element';
import { useMergedRef } from '../internal/use-merged-ref';
import type { FieldErrorProps, FieldErrorRenderProps, FieldErrorState } from './field-error.types';

interface ElementProps {
  readonly ref?: Ref<HTMLElement>;
}

function FieldErrorImpl({ render, ref, children, force, ...rest }: FieldErrorProps): ReactElement {
  const state = useFormFieldState();
  const parts = getFieldErrorProps({ force, state: state ?? undefined });
  const themeAttrs = useThemeAttrs(fieldErrorAnatomy);
  const elementRef = isValidElement<ElementProps>(render) ? render.props.ref : undefined;
  const mergedRef = useMergedRef<HTMLElement>(ref, elementRef, undefined);
  // The root stays rendered (a live region exists before its text appears); only the message is gated.
  const props = mergeProps(
    { ...themeAttrs.root, ...toReactProps(parts.root), ref: mergedRef, children: parts.shown ? children : undefined },
    rest,
  ) as unknown as FieldErrorRenderProps;
  // The part's children win over the element's own: the FieldError renders the message it is given.
  const element = isValidElement<{ children?: undefined }>(render)
    ? cloneElement(render, { children: undefined })
    : render;
  return renderElement<FieldErrorRenderProps, FieldErrorState>(element, 'div', props, { shown: parts.shown });
}

/** The {@link FieldError} component and its `displayName`. */
interface FieldErrorComponent {
  (props: FieldErrorProps): ReactElement;
  displayName: string;
}

/**
 * The error message of a field. It renders a `<div aria-live="polite">` that is always in the document. The message
 * is added only while it shows, so screen readers read it when it appears.
 *
 * Pass it to the `error` prop of a `FormField`, which can take several. There it shows while the field is not valid
 * and the user has left it or tried to submit, or with `force`.
 *
 * In a `FormField`, it describes the control. An error without an `id` gets `<fieldId>-error-<n>`. A hidden error
 * renders no message, so it adds nothing to the description of the control.
 *
 * Outside a `FormField`, it always shows, so you decide when to render it. It has no role and does not move the
 * focus. Native `div` props pass through, and `ref` reaches the element.
 *
 * @example
 * <label htmlFor="email">Email</label>
 * <input id="email" type="email" aria-invalid="true" aria-describedby="email-error" />
 * <FieldError id="email-error">Enter an email address.</FieldError>
 * @cckPart root
 * @param props - The FieldError props.
 * @returns The rendered div.
 */
export const FieldError: FieldErrorComponent = Object.assign(FieldErrorImpl, { displayName: 'FieldError' });
