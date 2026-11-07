'use client';

import type { ReactElement } from 'react';
import type { SelectFormInputProps } from '@cocokits/machines/select';
import { visuallyHiddenStyle } from '@cocokits/utils';

/** Props of {@link SelectFormInputs}. */
export interface SelectFormInputsProps {
  /** What the machine says the inputs carry. */
  readonly input: SelectFormInputProps;
  /** Whether the Select is a multiple one. */
  readonly multiple: boolean;
  /** The id of the form the inputs belong to. */
  readonly form: string | undefined;
  /** The `autocomplete` of the inputs. @defaultValue 'off' */
  readonly autoComplete: string | undefined;
  /** Called with the browser's validation message when an input is invalid; the Select marks itself invalid. */
  readonly onInvalid: (message: string) => void;
  /** Called with the text a browser autofill wrote to an input and the event; the Select picks the matching item. */
  readonly onFill: (text: string, event: Event) => void;
}

/**
 * The hidden native inputs of a Select: one with a single Select, one per value with `multiple` (one empty
 * input while a required multiple Select has no value, so the browser blocks the submit). They are text
 * inputs, clipped out of sight, not `hidden` ones, because a hidden input takes no part in constraint validation. They render when the
 * Select has a `name` or is required. They are controlled by the Select: a write by a browser autofill goes to
 * `onFill` and the input shows the current value again unless the Select changed. Internal.
 *
 * @param props - The inputs, `multiple`, `form`, `autoComplete` and the callbacks.
 * @returns The inputs, or nothing.
 */
export function SelectFormInputs({
  input,
  multiple,
  form,
  autoComplete,
  onInvalid,
  onFill,
}: SelectFormInputsProps): ReactElement | null {
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
            onFill(event.currentTarget.value, event.nativeEvent);
          }}
          onInvalid={(event) => {
            onInvalid(event.currentTarget.validationMessage);
          }}
        />
      ))}
    </>
  );
}
