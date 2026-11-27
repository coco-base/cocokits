import type { FormFieldState } from '../form-field';

/** Inputs of `getFieldErrorProps`. */
export interface FieldErrorProps {
  /** Shows the content regardless of the field state. @defaultValue false */
  readonly force?: boolean | undefined;
  /**
   * The resolved state of the enclosing FormField. Leave it out outside a field: with no state to gate on,
   * the content always shows.
   */
  readonly state?: Pick<FormFieldState, 'invalid' | 'touched' | 'submitted'> | undefined;
}

/** Props of the root part. */
export interface FieldErrorRootProps {
  /** The `cck-field-error` block class. */
  readonly class: string;
  /** The root is a polite live region, rendered before its content appears. */
  readonly 'aria-live': 'polite';
}

/** What `getFieldErrorProps` returns. */
export interface FieldErrorParts {
  /** The root props; always the same, whether the content is shown or not. */
  readonly root: FieldErrorRootProps;
  /** Whether the content is inserted. The root is rendered either way. */
  readonly shown: boolean;
}
