import { getFormFieldControlProps, isFilledText, type FormFieldControlContext } from '../form-field';
import { textareaAnatomy } from './textarea.anatomy';
import type { TextareaParts, TextareaProps } from './textarea.types';

/**
 * Computes the props of a Textarea and the state it reports to its field. Pure: no DOM, same result on the
 * server and the client. The Textarea follows the Input contract: the shared part is
 * `getFormFieldControlProps`; the Textarea adds only its class (a textarea has no `type`).
 *
 * @param state - The author's props and the tracked facts.
 * @param field - What the enclosing FormField gives the Textarea; leave it out outside a field.
 * @returns The root props and the control state for the field.
 */
export function getTextareaProps(state: TextareaProps, field?: FormFieldControlContext): TextareaParts {
  const { root, control } = getFormFieldControlProps({ ...state, filled: isFilledText(state.value) }, field);
  return { root: { class: textareaAnatomy.classes.root, ...root }, control };
}
