'use client';

import { useEffect, useState, type ChangeEvent, type FocusEvent, type RefObject } from 'react';
import { toReactProps, useFormParticipation } from '@cocokits/react-core';
import {
  formFieldStateAttrs,
  type FormFieldControlContext,
  type FormFieldControlProps,
  type FormFieldControlState,
} from '@cocokits/machines/form-field';
import type { ChangeDetails } from '@cocokits/shared';
import { hasAccessibleName } from '@cocokits/utils';
import { isDevelopment } from './dev';
import { useFormFieldContext } from './form-field-context';
import { useControlClaim, useControlReport } from './use-field-control';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

/** The attributes the machine owns: a value the author passes for them is ignored. */
export const textControlReserved: readonly string[] = [...formFieldStateAttrs, 'aria-invalid'];

/** Why the value of a text control changed: the user typed (`'user'`) or the owner form was reset (`'form-reset'`). */
export type TextControlChangeReason = 'user' | 'form-reset';

/** What `onValueChange` of a text control receives besides the value. */
export type TextControlChangeDetails = ChangeDetails<TextControlChangeReason>;

/** What the machine call of a text control takes: the shared control props and the value. */
export type TextControlMachineState = Omit<FormFieldControlProps, 'filled'> & {
  readonly value?: string | null | undefined;
};

/** The props the Input and the Textarea share; the hook reads them and the component spreads the rest. */
export interface TextControlProps {
  readonly value?: string | null | undefined;
  readonly defaultValue?: string | undefined;
  readonly onValueChange?: ((value: string, details: TextControlChangeDetails) => void) | undefined;
  readonly id?: string | undefined;
  readonly name?: string | undefined;
  readonly 'aria-describedby'?: string | undefined;
  readonly disabled?: boolean | undefined;
  readonly readOnly?: boolean | undefined;
  readonly required?: boolean | undefined;
  readonly hidden?: boolean | undefined;
  readonly invalid?: boolean | undefined;
  readonly pending?: boolean | undefined;
  readonly touched?: boolean | undefined;
  readonly dirty?: boolean | undefined;
  readonly submitted?: boolean | undefined;
}

/** What differs between the controls. */
export interface TextControlOptions<E extends HTMLInputElement | HTMLTextAreaElement> {
  /** The component name, for the development warning. */
  readonly componentName: 'Input' | 'Textarea';
  /** The ref of the element; the component merges it with the author's `ref`. */
  readonly elementRef: RefObject<E | null>;
  /** The theme attributes of the root part. */
  readonly rootThemeAttrs: object;
  /** The machine call of the control. */
  readonly getParts: (
    state: TextControlMachineState,
    field?: FormFieldControlContext,
  ) => { readonly root: object; readonly control: FormFieldControlState };
  /** The text as the DOM holds it; the Textarea shows CR and CRLF as LF. Default: the text itself. The reset callback receives this form too. */
  readonly toDomText?: ((text: string) => string) | undefined;
}

/** The machine only needs to know whether the text of an uncontrolled control is empty. */
const textOf = (filled: boolean): string => (filled ? 'filled' : '');

const isSameText = (text: string): string => text;

/**
 * The behaviour of a native text control (`input` or `textarea`) in a FormField: value (controlled or
 * uncontrolled), the tracked facts, form participation, the registration with the field and the
 * development warnings. The Input and the Textarea call it and render their own element.
 *
 * @param props - The shared props of the control.
 * @param options - What differs between the controls.
 * @returns The props to put on the element before the author's rest props.
 */
export function useTextControl<E extends HTMLInputElement | HTMLTextAreaElement>(
  props: TextControlProps,
  options: TextControlOptions<E>,
): Record<string, unknown> {
  const { value, defaultValue, onValueChange, id, name, hidden, disabled, readOnly, required } = props;
  const { componentName, elementRef, rootThemeAttrs, getParts, toDomText = isSameText } = options;
  const field = useFormFieldContext();
  const controlled = value !== undefined;
  const [mountValue] = useState(() => value ?? defaultValue ?? '');
  // Uncontrolled: the DOM is the source, and this fact is read from it.
  const [domFilled, setDomFilled] = useState(() => defaultValue !== undefined && defaultValue !== '');
  const [focused, setFocused] = useState(false);
  const [touchedState, setTouchedState] = useState(false);
  const [dirtyState, setDirtyState] = useState(false);
  const primary = useControlClaim(
    field,
    elementRef,
    'This control gets no generated id and no description from the field, and its state does not reach the field.',
  );

  const participation = useFormParticipation({
    elementRef,
    getValue: () => (controlled ? toDomText(value ?? '') : (elementRef.current?.value ?? '')),
    onReset: (event) => {
      const next = controlled ? toDomText(mountValue) : (elementRef.current?.value ?? '');
      setTouchedState(false);
      setDirtyState(false);
      setDomFilled(next !== '');
      onValueChange?.(next, { reason: 'form-reset', event });
    },
  });

  const parts = getParts(
    {
      value: controlled ? value : textOf(domFilled),
      id,
      ariaDescribedBy: props['aria-describedby'],
      name,
      disabled: disabled === true || participation.fieldsetDisabled,
      readOnly,
      required,
      invalid: props.invalid,
      pending: props.pending,
      touched: props.touched ?? touchedState,
      dirty: props.dirty ?? dirtyState,
      submitted: props.submitted ?? participation.submitted,
      focused,
      hidden,
    },
    field ? { ids: primary ? field.ids : undefined, state: field.own } : undefined,
  );

  useControlReport(field, elementRef, primary, parts.control);

  // The DOM can change without an event (a ref write, the browser restoring text), so read it after every commit.
  useIsomorphicLayoutEffect(() => {
    const element = elementRef.current;
    if (!controlled && element) setDomFilled(element.value !== '');
  });

  const inField = field !== null;
  useEffect(() => {
    if (!isDevelopment()) return undefined;
    // After the Label's `for` has committed.
    const frame = requestAnimationFrame(() => {
      if (elementRef.current && !hasAccessibleName(elementRef.current)) {
        console.warn(
          `CocoKits: ${componentName === 'Input' ? 'an' : 'a'} ${componentName}${inField ? ' in a FormField' : ''} has no accessible name. ${inField ? 'Add a Label with text to the FormField, or an aria-label, a title, or an aria-labelledby that points to an element with text.' : 'Add an aria-label, a title, an aria-labelledby that points to an element with text, or a <label for> with text that points at its id.'}`,
        );
      }
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [inField, componentName, elementRef]);

  return {
    ...rootThemeAttrs,
    ...toReactProps(parts.root),
    ...(controlled ? { value: toDomText(value ?? '') } : { defaultValue }),
    onChange: (event: ChangeEvent<E>) => {
      const next = event.currentTarget.value;
      setDirtyState(true);
      setDomFilled(next !== '');
      onValueChange?.(next, { reason: 'user', event: event.nativeEvent });
    },
    onFocus: (event: FocusEvent<E>) => {
      setFocused(true);
      setDomFilled(event.currentTarget.value !== '');
    },
    onBlur: (event: FocusEvent<E>) => {
      setFocused(false);
      setTouchedState(true);
      setDomFilled(event.currentTarget.value !== '');
    },
  };
}
