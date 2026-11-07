'use client';

import { useRef, type ReactElement } from 'react';
import { useThemeAttrs } from '@cocokits/react-core';
import { getInputProps, inputAnatomy } from '@cocokits/machines/input';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { useMergedRef } from '../internal/use-merged-ref';
import { textControlReserved, useTextControl } from '../internal/use-text-control';
import type { InputProps } from './input.types';

function InputImpl({
  value,
  defaultValue,
  onValueChange,
  type,
  id,
  name,
  'aria-describedby': ariaDescribedBy,
  disabled,
  readOnly,
  required,
  hidden,
  invalid,
  pending,
  touched,
  dirty,
  submitted,
  ref,
  ...rest
}: InputProps): ReactElement {
  const themeAttrs = useThemeAttrs(inputAnatomy);
  const elementRef = useRef<HTMLInputElement | null>(null);
  const mergedRef = useMergedRef<HTMLInputElement>(ref, elementRef, undefined);
  const controlProps = useTextControl<HTMLInputElement>(
    {
      value,
      defaultValue,
      onValueChange,
      id,
      name,
      'aria-describedby': ariaDescribedBy,
      disabled,
      readOnly,
      required,
      hidden,
      invalid,
      pending,
      touched,
      dirty,
      submitted,
    },
    {
      componentName: 'Input',
      elementRef,
      rootThemeAttrs: themeAttrs.root,
      getParts: (state, field) => getInputProps({ ...state, type }, field),
    },
  );
  return <input {...mergeProps(controlProps, withoutReserved(rest, textControlReserved))} ref={mergedRef} />;
}

/** The {@link Input} component and its `displayName`. */
interface InputComponent {
  (props: InputProps): ReactElement;
  displayName: string;
}

/**
 * Renders a native `<input>` for a line of text: `text`, `email`, `password`, `search`, `tel` or
 * `url`. It is a real form control, so `FormData`, constraint validation, the `form` attribute,
 * implicit submission and `fieldset[disabled]` work, and it works with react-hook-form `register()`
 * and `Controller`. Without `value` it is uncontrolled (`defaultValue`, the DOM holds the text); with
 * `value` it is controlled and a change the parent rejects is restored.
 *
 * Inside a FormField it gets the id `<fieldId>-control`, the Label names it, and its
 * `aria-describedby` ends with the feedback wrapper that holds the hints. An `id`,
 * `aria-describedby` or `type` you write replaces or comes before the default (`type` is `text`).
 * The state facts are `data-*` attributes, and `aria-invalid="true"` appears only while the control
 * is invalid and was touched or the form was submitted. Native `required`, `disabled`, `readOnly`
 * and `hidden` pass through. Native attributes pass through, and `ref` reaches the `input`.
 *
 * @example
 * <FormField label={<Label>Email address</Label>}>
 *   <Input type="email" onValueChange={(value) => setEmail(value)} />
 * </FormField>
 * @cckPart root
 * @param props - The Input props.
 * @returns The rendered input.
 */
export const Input: InputComponent = Object.assign(InputImpl, { displayName: 'Input' });
