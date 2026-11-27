import type { CheckboxDecorativeProps, CheckboxLabelProps, CheckboxPartProps } from '../checkbox';

/**
 * Inputs of `getRadioProps`. A standalone radio has no FormField contract; its only facts are `checked`, `disabled` and `required`.
 * A missing fact is `false`.
 */
export interface RadioProps {
  /** The input id; the label's `for` equals it. The adapter generates one when the author gives none. */
  readonly id?: string | undefined;
  /** The author's `name`. Radios with the same name form a native group. */
  readonly name?: string | undefined;
  /** The model value. `null` and `undefined` render unchecked. */
  readonly checked?: boolean | null | undefined;
  /** Disabled by a prop or an ancestor fieldset. */
  readonly disabled?: boolean | undefined;
  /** Required. */
  readonly required?: boolean | undefined;
  /** The roving tab stop, set by a Radio group after mount; left out, the input has no `tabindex`. */
  readonly tabIndex?: 0 | -1 | undefined;
}

/** Props of the root part. Absent keys are `undefined`. */
export interface RadioRootProps {
  /** The `cck-radio` block class. */
  readonly class: string;
  /** Present (empty) while checked. */
  readonly 'data-checked'?: '' | undefined;
  /** Present (empty) while disabled. */
  readonly 'data-disabled'?: '' | undefined;
  /** Present (empty) while required. */
  readonly 'data-required'?: '' | undefined;
}

/** Props of the native input. Absent keys are `undefined`. */
export interface RadioInputProps extends CheckboxPartProps {
  /** The author's or generated id. */
  readonly id?: string | undefined;
  /** The author's name. */
  readonly name?: string | undefined;
  /** Always `'radio'`. */
  readonly type: 'radio';
  /** The checked value; a nullish model is `false`. */
  readonly checked: boolean;
  /** Native `disabled`. */
  readonly disabled?: true | undefined;
  /** Native `required`. */
  readonly required?: true | undefined;
  /** `0` on the roving tab stop of a Radio group, `-1` on the other radios; absent outside a group. */
  readonly tabIndex?: 0 | -1 | undefined;
}

/** What `getRadioProps` returns. A Radio reports nothing to a field. */
export interface RadioParts {
  /** The root props. */
  readonly root: RadioRootProps;
  /** Holds the dot and the label. */
  readonly wrapper: CheckboxPartProps;
  /** The dot and hit area. It does not render the input. */
  readonly inputWrapper: CheckboxPartProps;
  /** The native input. */
  readonly input: RadioInputProps;
  /** Decorative halo. */
  readonly backdrop: CheckboxDecorativeProps;
  /** Decorative ring and dot. */
  readonly background: CheckboxDecorativeProps;
  /** The native label. */
  readonly label: CheckboxLabelProps;
}
