import type { FormFieldControlProps, FormFieldControlRootProps, FormFieldControlState } from '../form-field';

/**
 * Inputs of `getCheckboxProps`: the shared control props (see {@link FormFieldControlProps}) plus the
 * checked value and the mixed state. A missing fact is `false`.
 */
export interface CheckboxProps extends Omit<FormFieldControlProps, 'filled'> {
  /** The model value. `null` and `undefined` render unchecked. */
  readonly checked?: boolean | null | undefined;
  /**
   * Whether the checkbox shows the mixed state. One-way: the component never changes it. `data-indeterminate`
   * renders on the server; the DOM property is set after mount.
   */
  readonly indeterminate?: boolean | undefined;
}

/**
 * Props of the root part: the facts of a form-field control without `data-filled` (`data-checked` replaces
 * it) and without the control attributes, which go to the input.
 */
export interface CheckboxRootProps extends Omit<
  FormFieldControlRootProps,
  'id' | 'name' | 'disabled' | 'readonly' | 'required' | 'aria-invalid' | 'aria-describedby' | 'data-filled'
> {
  /** The `cck-checkbox` block class. */
  readonly class: string;
  /** Present (empty) while checked. */
  readonly 'data-checked'?: '' | undefined;
  /** Present (empty) while the `indeterminate` prop is true. */
  readonly 'data-indeterminate'?: '' | undefined;
}

/** Props of a container part. */
export interface CheckboxPartProps {
  /** The part's class from the anatomy. */
  readonly class: string;
}

/** Props of a decorative part. */
export interface CheckboxDecorativeProps extends CheckboxPartProps {
  /** Always `'true'`: the part never joins the name. */
  readonly 'aria-hidden': 'true';
}

/** Props of the label part. */
export interface CheckboxLabelProps extends CheckboxPartProps {
  /** The input id, so a click on the label toggles the input and the label names it. */
  readonly for?: string | undefined;
}

/** Props of the native input. Absent keys are `undefined`. */
export interface CheckboxInputProps extends CheckboxPartProps {
  /** The author's id, or the control id inside a field; the label's `for` equals it. */
  readonly id?: string | undefined;
  /** The author's name, or the joined control path. */
  readonly name?: string | undefined;
  /** Always `'checkbox'`. */
  readonly type: 'checkbox';
  /** The checked value; a nullish model is `false`. */
  readonly checked: boolean;
  /** Native `disabled`. */
  readonly disabled?: true | undefined;
  /** Native `required`. */
  readonly required?: true | undefined;
  /** `'true'` only while read-only: `readonly` does not apply to a checkbox. */
  readonly 'aria-readonly'?: 'true' | undefined;
  /** `'true'` only while invalid and (touched or submitted). Never `'false'`. */
  readonly 'aria-invalid'?: 'true' | undefined;
  /** The author's ids first, then the hint ids, then the error ids. */
  readonly 'aria-describedby'?: string | undefined;
}

/** What `getCheckboxProps` returns. */
export interface CheckboxParts {
  /** The root props. */
  readonly root: CheckboxRootProps;
  /** Holds the box and the label. */
  readonly wrapper: CheckboxPartProps;
  /** The box and hit area. It does not render the input. */
  readonly inputWrapper: CheckboxPartProps;
  /** The native input. */
  readonly input: CheckboxInputProps;
  /** Decorative halo. */
  readonly backdrop: CheckboxDecorativeProps;
  /** Decorative box, tick and dash. */
  readonly background: CheckboxDecorativeProps;
  /** The native label. */
  readonly label: CheckboxLabelProps;
  /** What the Checkbox reports to its FormField: the effective id and facts, with `filled` = checked. */
  readonly control: FormFieldControlState;
}
