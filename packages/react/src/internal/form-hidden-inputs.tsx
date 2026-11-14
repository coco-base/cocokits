'use client';

import type { ReactElement } from 'react';
import type { FormHiddenInputProps } from '@cocokits/machines/form-field';
import { visuallyHiddenStyle } from '@cocokits/utils';

/** Props of {@link FormHiddenInputs}. */
export interface FormHiddenInputsProps {
  /** What the machine says the inputs carry. */
  readonly input: FormHiddenInputProps;
  /** Whether the control holds a list of values: a multiple Select or a Chip list. */
  readonly multiple: boolean;
  /** The id of the form the inputs belong to. */
  readonly form: string | undefined;
  /** The `autocomplete` of the inputs. @defaultValue 'off' */
  readonly autoComplete?: string | undefined;
  /** Called with the browser's validation message when an input is invalid; the control marks itself invalid. */
  readonly onInvalid: (message: string) => void;
  /**
   * Called with the text a browser autofill wrote to an input and the event; the control picks the matching item. A
   * control with no autofill source leaves it out, and the input shows the current value again.
   */
  readonly onFill?: ((text: string, event: Event) => void) | undefined;
}

/**
 * The hidden native inputs of a custom form control: one with a single value, one per value with `multiple` (one
 * empty input while a required list has no value, so the browser blocks the submit). They are text inputs, clipped
 * out of sight, not `hidden` ones, because a hidden input takes no part in constraint validation. They render when
 * the control has a `name` or is required. They are controlled by the control: a write by a browser autofill goes
 * to `onFill` and the input shows the current value again unless the control changed. Internal.
 *
 * @param props - The inputs, `multiple`, `form`, `autoComplete` and the callbacks.
 * @returns The inputs, or nothing.
 */
export function FormHiddenInputs({
  input,
  multiple,
  form,
  autoComplete,
  onInvalid,
  onFill,
}: FormHiddenInputsProps): ReactElement | null {
  const { name, required, disabled, values } = input;
  if (!name && !required) return null;
  const entries = multiple && values.length === 0 && required ? [''] : values;
  return (
    <>
      {entries.map((entry, index) => (
        <input
          key={`${String(index)}:${entry}`}
          type="text"
          tabIndex={-1}
          aria-hidden="true"
          autoComplete={autoComplete ?? 'off'}
          style={visuallyHiddenStyle}
          name={name}
          form={form}
          required={required}
          disabled={disabled}
          value={entry}
          onChange={(event) => {
            onFill?.(event.currentTarget.value, event.nativeEvent);
          }}
          onInvalid={(event) => {
            onInvalid(event.currentTarget.validationMessage);
          }}
        />
      ))}
    </>
  );
}
