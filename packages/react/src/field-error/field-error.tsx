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
 * Renders a `<div>` by default with the error message of a field. The `div` is a polite live region
 * (`aria-live="polite"`) that is always rendered; its content is inserted only while it shows, so the
 * message is announced when it appears. Inside a FormField it shows while the field is invalid and was
 * touched or the form was submitted, or with `force`; outside a FormField it always shows, and you render
 * the content conditionally. The message is not rendered while hidden, so a hidden FieldError adds nothing to
 * the description of the control. Pass it to the `error` prop of a FormField; several are allowed. It has
 * no role and does not move focus. Native div attributes pass through, and `ref` reaches the div.
 *
 * @example
 * <FormField error={<FieldError>Enter an email address.</FieldError>} label={<Label>Email</Label>}>
 *   <Input type="email" invalid />
 * </FormField>
 * @cckPart root
 * @param props - The FieldError props.
 * @returns The rendered div.
 */
export const FieldError: FieldErrorComponent = Object.assign(FieldErrorImpl, { displayName: 'FieldError' });
