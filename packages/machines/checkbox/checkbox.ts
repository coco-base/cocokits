import { getFormFieldControlProps, type FormFieldControlContext } from '../form-field';
import { checkboxAnatomy } from './checkbox.anatomy';
import type { CheckboxParts, CheckboxProps } from './checkbox.types';

const present = (condition: boolean): '' | undefined => (condition ? '' : undefined);

/**
 * Computes the props of a Checkbox and the state it reports to its field. Pure: no DOM, same result on the
 * server and the client. The control-agnostic part is `getFormFieldControlProps` with `filled` = checked;
 * the Checkbox moves the control attributes to the input, swaps `readonly` for `aria-readonly` and replaces
 * `data-filled` on the root with `data-checked`.
 *
 * @param state - The author's props and the tracked facts.
 * @param field - What the enclosing FormField gives the Checkbox; leave it out outside a field.
 * @returns The props of each part and the control state for the field.
 */
export function getCheckboxProps(state: CheckboxProps, field?: FormFieldControlContext): CheckboxParts {
  const checked = state.checked === true;
  const { root, control } = getFormFieldControlProps({ ...state, filled: checked }, field);
  const {
    id,
    name,
    disabled,
    readonly,
    required,
    'aria-invalid': invalid,
    'aria-describedby': describedBy,
    ...facts
  } = root;
  // `data-checked` replaces `data-filled` on a choice root.
  delete facts['data-filled'];
  const { classes } = checkboxAnatomy;
  return {
    root: {
      ...facts,
      class: classes.root,
      'data-checked': present(checked),
      'data-indeterminate': present(state.indeterminate === true),
    },
    wrapper: { class: classes.wrapper },
    inputWrapper: { class: classes.inputWrapper },
    input: {
      class: classes.input,
      id,
      name,
      type: 'checkbox',
      checked,
      disabled,
      required,
      'aria-readonly': readonly ? 'true' : undefined,
      'aria-invalid': invalid,
      'aria-describedby': describedBy,
    },
    backdrop: { class: classes.backdrop, 'aria-hidden': 'true' },
    background: { class: classes.background, 'aria-hidden': 'true' },
    label: { class: classes.label, for: id },
    control,
  };
}
