import { invalidShown } from '../form-field';
import { fieldErrorAnatomy } from './field-error.anatomy';
import type { FieldErrorParts, FieldErrorProps } from './field-error.types';

/**
 * Computes the props of a FieldError and whether its content shows. Pure.
 *
 * Content shows with `force`, outside a field (no state), and inside a field while it is invalid and was
 * touched or submitted (the gate of `aria-invalid`).
 *
 * @param input - `force` and the resolved state of the enclosing FormField.
 * @returns The root props and `shown`.
 */
export function getFieldErrorProps(input: FieldErrorProps): FieldErrorParts {
  const { force = false, state } = input;
  return {
    root: { class: fieldErrorAnatomy.classes.root, 'aria-live': 'polite' },
    shown: force || (state ? invalidShown(state) : true),
  };
}
