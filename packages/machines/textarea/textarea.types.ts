import type { FormFieldControlProps, FormFieldControlRootProps, FormFieldControlState } from '../form-field';

/**
 * Inputs of `getTextareaProps`: the shared control props (see {@link FormFieldControlProps}) plus the value.
 * A missing fact is `false`.
 */
export interface TextareaProps extends Omit<FormFieldControlProps, 'filled'> {
  /** The model value. `null`, `undefined` and `''` are all empty. */
  readonly value?: string | null | undefined;
}

/** Props of the root part. Absent keys are `undefined`. There is no `type`: a textarea has none. */
export interface TextareaRootProps extends FormFieldControlRootProps {
  /** The `cck-textarea` block class. */
  readonly class: string;
}

/** What `getTextareaProps` returns. */
export interface TextareaParts {
  /** The root props. */
  readonly root: TextareaRootProps;
  /** What the Textarea reports to its FormField: the effective id and the effective facts. */
  readonly control: FormFieldControlState;
}
