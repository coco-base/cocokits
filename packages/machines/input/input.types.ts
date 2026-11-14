import type { FormFieldControlProps, FormFieldControlRootProps, FormFieldControlState } from '../form-field';

/** The text types the Input supports, stated once: `InputType` and the fallback in `getInputProps` derive from it. */
export const inputTypes = ['text', 'email', 'password', 'search', 'tel', 'url'] as const;

/**
 * The text types the Input supports.
 *
 * @cckValue text - Plain text.
 * @cckValue email - An email address. The browser checks its form.
 * @cckValue password - A password. The browser hides the characters.
 * @cckValue search - A search term.
 * @cckValue tel - A phone number. Phones show a number keypad.
 * @cckValue url - A web address. The browser checks its form.
 */
export type InputType = (typeof inputTypes)[number];

/**
 * Inputs of `getInputProps`: the shared control props (see {@link FormFieldControlProps}) plus the value and
 * the `type`. A missing fact is `false`.
 */
export interface InputProps extends Omit<FormFieldControlProps, 'filled'> {
  /** The model value. `null`, `undefined` and `''` are all empty. */
  readonly value?: string | null | undefined;
  /** The `type` attribute. @defaultValue 'text' */
  readonly type?: InputType | undefined;
}

/** Props of the root part. Absent keys are `undefined`. The facts are those of the FormField root. */
export interface InputRootProps extends FormFieldControlRootProps {
  /** The `cck-input` block class. */
  readonly class: string;
  /** The type, `text` by default and for any value outside the six text types. */
  readonly type: InputType;
}

/** What `getInputProps` returns. */
export interface InputParts {
  /** The root props. */
  readonly root: InputRootProps;
  /** What the Input reports to its FormField: the effective id and the effective facts. */
  readonly control: FormFieldControlState;
}
