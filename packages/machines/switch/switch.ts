import { getCheckboxProps } from '../checkbox';
import type { FormFieldControlContext } from '../form-field';
import { switchAnatomy } from './switch.anatomy';
import type { SwitchParts, SwitchProps } from './switch.types';

/**
 * Computes the props of a Switch and the state it reports to its field. Pure: no DOM, same result on the
 * server and the client. The Switch is a Checkbox without `indeterminate`: it reuses `getCheckboxProps` for
 * the facts and the input, and adds `role="switch"` and its own parts.
 *
 * @param state - The author's props and the tracked facts.
 * @param field - What the enclosing FormField gives the Switch; leave it out outside a field.
 * @returns The props of each part and the control state for the field.
 */
export function getSwitchProps(state: SwitchProps, field?: FormFieldControlContext): SwitchParts {
  const { root, input, label, control } = getCheckboxProps({ ...state, indeterminate: false }, field);
  const facts = { ...root };
  delete facts['data-indeterminate'];
  const { classes } = switchAnatomy;
  return {
    root: { ...facts, class: classes.root },
    label: { ...label, class: classes.label },
    track: { class: classes.track },
    input: { ...input, class: classes.input, role: 'switch' },
    thumb: { class: classes.thumb, 'aria-hidden': 'true' },
    backdrop: { class: classes.backdrop, 'aria-hidden': 'true' },
    control,
  };
}
