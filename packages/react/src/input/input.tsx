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
 * A box for one line of text. It renders a native `<input>` of the type `text`, `email`, `password`, `search`, `tel`
 * or `url`. Native `input` props pass through, and `ref` reaches the element.
 *
 * Outside a FormField, add `aria-label` or `aria-labelledby`, or a `<label for>` with text.
 *
 * It is a native form control. `FormData`, the native checks, the `form` prop, submit by Enter and a disabled
 * `fieldset` work. It works with react-hook-form `register()` and `Controller`.
 *
 * Control the text with `value` and `onValueChange`, or set `defaultValue` and let the DOM keep it. A change that
 * you do not take is undone.
 *
 * Inside a `FormField`, it gets the id `<fieldId>-control`, and the `Label` names it. The ids of the hints and
 * errors of the field describe it. An `id` or `aria-describedby` you write wins or comes first.
 *
 * The element has the state as `data-*` attributes. It gets `aria-invalid="true"` only while it is not valid and
 * the user has left it or tried to submit.
 *
 * @example
 * <label htmlFor="email">Email address</label>
 * <Input id="email" type="email" defaultValue="ana@example.com" />
 * @cckPart root
 * @param props - The Input props.
 * @returns The rendered input.
 */
export const Input: InputComponent = Object.assign(InputImpl, { displayName: 'Input' });
