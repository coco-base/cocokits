import { h, type VNode } from 'vue';
import type { FormHiddenInputProps } from '@cocokits/machines/form-field';
import { visuallyHiddenStyle } from '@cocokits/utils';

/** What {@link formHiddenInputs} needs. */
export interface FormHiddenInputsOptions {
  /** The strings to render, one input each; the control decides what an empty value submits. */
  readonly entries: readonly string[];
  /** The machine's `name`, `disabled` and `required` for every input. */
  readonly formInput: FormHiddenInputProps;
  /** The `form` attribute: the id of the form the inputs belong to. */
  readonly form: string | undefined;
  /** The `autocomplete` attribute. A control with no autofill source passes `'off'`. */
  readonly autocomplete: string;
  /** A counter: a new value makes the inputs again, so a reset of the browser cannot leave one empty. */
  readonly generation: number;
  /** The `invalid` event: a blocked submit. It never cancels the event. */
  readonly onInvalid: (event: Event) => void;
  /** A browser autofill wrote to an input. Leave it out for a control that has no autofill source. */
  readonly onWrite?: ((event: Event) => void) | undefined;
}

/**
 * The clipped native `type="text"` inputs a custom form control renders so that `FormData`, native `required`, the
 * `form` attribute and the browser's validation work (the Select and the Chip list). They are out of the tab order
 * and hidden from assistive technology.
 *
 * @internal
 * @param options - The strings to submit and how the inputs are bound.
 * @returns One input vnode per entry.
 */
export function formHiddenInputs(options: FormHiddenInputsOptions): VNode[] {
  const { entries, formInput, form, autocomplete, generation, onInvalid, onWrite } = options;
  return entries.map((entry, index) =>
    h('input', {
      key: [generation, index].join(':'),
      type: 'text',
      tabindex: -1,
      'aria-hidden': 'true',
      autocomplete,
      style: visuallyHiddenStyle,
      name: formInput.name,
      form,
      required: formInput.required,
      disabled: formInput.disabled,
      value: entry,
      onInvalid,
      onInput: onWrite,
      onChange: onWrite,
    }),
  );
}

/**
 * The strings a custom form control submits: none without a `name` and without `required`; with `multiple`, one empty
 * string while the list is empty and required, so the browser blocks the submit.
 *
 * @internal
 * @param formInput - The machine's form-input facts.
 * @param multiple - Whether the control holds a list of values.
 * @returns The entries to render, one input each.
 */
export function formHiddenEntries(formInput: FormHiddenInputProps, multiple: boolean): readonly string[] {
  const { name, required, values } = formInput;
  if (!name && !required) return [];
  if (multiple && values.length === 0 && required) return [''];
  return values;
}
