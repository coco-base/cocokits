'use client';

import { useRef, type ReactElement } from 'react';
import { useThemeAttrs } from '@cocokits/react-core';
import { getTextareaProps, textareaAnatomy } from '@cocokits/machines/textarea';
import { mergeProps, withoutReserved } from '../internal/merge-props';
import { useMergedRef } from '../internal/use-merged-ref';
import { textControlReserved, useTextControl } from '../internal/use-text-control';
import type { TextareaProps } from './textarea.types';

/** The text as a textarea holds it: CR and CRLF are LF, so a model with CRLF does not rewrite the DOM. */
const withLineFeeds = (text: string): string => text.replace(/\r\n?/g, '\n');

function TextareaImpl({
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
  ref,
  ...rest
}: TextareaProps): ReactElement {
  const themeAttrs = useThemeAttrs(textareaAnatomy);
  const elementRef = useRef<HTMLTextAreaElement | null>(null);
  const mergedRef = useMergedRef<HTMLTextAreaElement>(ref, elementRef, undefined);
  const controlProps = useTextControl<HTMLTextAreaElement>(
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
      componentName: 'Textarea',
      elementRef,
      rootThemeAttrs: themeAttrs.root,
      getParts: getTextareaProps,
      toDomText: withLineFeeds,
    },
  );
  return <textarea {...mergeProps(controlProps, withoutReserved(rest, textControlReserved))} ref={mergedRef} />;
}

/** The {@link Textarea} component and its `displayName`. */
interface TextareaComponent {
  (props: TextareaProps): ReactElement;
  displayName: string;
}

/**
 * Renders a native `<textarea>` for several lines of text. It follows the contract of the Input: a real
 * form control, so `FormData`, constraint validation, the `form` attribute and `fieldset[disabled]` work,
 * and it works with react-hook-form `register()` and `Controller`. Without `value` it is uncontrolled
 * (`defaultValue`, the DOM holds the text); with `value` it is controlled and React restores a change the
 * parent rejects. Enter inserts a line break and never submits the form. A value with CR or CRLF shows
 * with LF, as the element does, and the DOM is not rewritten for that.
 *
 * Inside a FormField it gets the id `<fieldId>-control`, the Label names it, and its
 * `aria-describedby` ends with the feedback wrapper that holds the hints and the FieldError. An `id` or `aria-describedby`
 * you write replaces or comes before the default. The state facts are `data-*` attributes, and
 * `aria-invalid="true"` appears only while the control is invalid and was touched or the form was
 * submitted. Native `required`, `disabled`, `readOnly`, `hidden`, `rows` and the other textarea attributes
 * pass through, and `ref` reaches the `textarea`.
 *
 * @example
 * <FormField label={<Label>Message</Label>}>
 *   <Textarea rows={4} onValueChange={(value) => setMessage(value)} />
 * </FormField>
 * @cckPart root
 * @param props - The Textarea props.
 * @returns The rendered textarea.
 */
export const Textarea: TextareaComponent = Object.assign(TextareaImpl, { displayName: 'Textarea' });
