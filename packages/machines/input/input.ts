import { getFormFieldControlProps, isFilledText, type FormFieldControlContext } from '../form-field';
import { inputAnatomy } from './input.anatomy';
import { inputTypes } from './input.types';
import type { InputParts, InputProps, InputType } from './input.types';

/** Any other `type` (a string from untyped code) falls back to `text`: the Input is a text control only. */
const textType = (type: string | undefined): InputType => inputTypes.find((known) => known === type) ?? 'text';

/**
 * Computes the props of an Input and the state it reports to its field. Pure: no DOM, same result on the
 * server and the client. The control-agnostic part is `getFormFieldControlProps`; the Input adds its class
 * and `type`.
 *
 * @param state - The author's props and the tracked facts.
 * @param field - What the enclosing FormField gives the Input; leave it out outside a field.
 * @returns The root props and the control state for the field.
 */
export function getInputProps(state: InputProps, field?: FormFieldControlContext): InputParts {
  const { root, control } = getFormFieldControlProps({ ...state, filled: isFilledText(state.value) }, field);
  return { root: { class: inputAnatomy.classes.root, ...root, type: textType(state.type) }, control };
}
