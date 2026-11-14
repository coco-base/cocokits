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
 * A box for several lines of text. It renders a native `<textarea>`. Native `textarea` props such as `rows` pass
 * through, and `ref` reaches the element.
 *
 * It is a native form control. `FormData`, the native checks, the `form` prop and a disabled `fieldset` work. It
 * works with react-hook-form `register()` and `Controller`.
 *
 * Control the text with `value` and `onValueChange`, or set `defaultValue` and let the DOM keep it. A change that
 * you do not take is undone.
 *
 * Enter adds a line break and never submits the form. A line break written as CR or CRLF shows as LF, as in the
 * native element, and the DOM is not written again for it.
 *
 * Inside a `FormField`, it gets the id `<fieldId>-control`, and the `Label` names it. The ids of the hints and
 * errors of the field describe it. An `id` or `aria-describedby` you write wins or comes first.
 * Outside a FormField, add `aria-label` or `aria-labelledby`, or a `<label for>` with text.
 *
 * The element has the state as `data-*` attributes. It gets `aria-invalid="true"` only while it is not valid and
 * the user has left it or tried to submit.
 *
 * @example
 * <label htmlFor="message">Message</label>
 * <Textarea id="message" rows={4} defaultValue="Hello" />
 * @cckPart root
 * @param props - The Textarea props.
 * @returns The rendered textarea.
 */
export const Textarea: TextareaComponent = Object.assign(TextareaImpl, { displayName: 'Textarea' });
