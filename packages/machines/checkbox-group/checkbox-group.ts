import { dataAttr } from '@cocokits/utils';
import { getFormFieldControlProps, type FormFieldControlContext } from '../form-field';
import { checkboxGroupAnatomy } from './checkbox-group.anatomy';
import type { CheckboxGroupParts, CheckboxGroupProps } from './checkbox-group.types';

/** The development warning for a group that nothing names. */
export const CHECKBOX_GROUP_NAME_WARNING =
  'CocoKits: a checkbox group has no name. Put it in a FormField with a Label, or give it aria-label or aria-labelledby.';

/**
 * Adds or removes one value of the group. Pure: it never changes the list it gets.
 *
 * @param value - The checked values.
 * @param item - The `value` of the checkbox that changed.
 * @param checked - Whether the checkbox is now checked.
 * @returns The list with the value at the end, or without it; the same list, unchanged, when nothing changes
 * (compare by reference to know whether to report a change).
 */
export function toggleCheckboxGroupValue(value: readonly string[], item: string, checked: boolean): readonly string[] {
  if (value.includes(item) === checked) return value;
  return checked ? [...value, item] : value.filter((candidate) => candidate !== item);
}

/** The Label of the field names the group only while the author gave no `aria-label` and the field holds a Label. */
function labelledBy(state: CheckboxGroupProps, field?: FormFieldControlContext): string | undefined {
  if (state.ariaLabelledBy !== undefined && state.ariaLabelledBy !== '') return state.ariaLabelledBy;
  return state.ariaLabel === undefined && field?.hasLabel === true ? field.ids?.label : undefined;
}

/**
 * Computes the props of the group and what it gives each checkbox, and the state it reports to its field. Pure:
 * no DOM, same result on the server and the client. The group is the labelled element of its field: it reports
 * `group`, and its `aria-labelledby` is the Label of the field unless the author named it.
 *
 * @param state - The author's props and the tracked facts.
 * @param field - What the enclosing FormField gives the group; leave it out outside a field.
 * @returns The root props, the facts of each checkbox, whether the group is named and the control state.
 */
export function getCheckboxGroupProps(state: CheckboxGroupProps, field?: FormFieldControlContext): CheckboxGroupParts {
  const filled = (state.value ?? []).length > 0;
  const { root, control } = getFormFieldControlProps({ ...state, filled }, field);
  const ariaLabelledBy = labelledBy(state, field);
  const ariaLabel = state.ariaLabel === '' ? undefined : state.ariaLabel;
  return {
    root: {
      class: checkboxGroupAnatomy.classes.root,
      role: 'group',
      id: root.id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': root['aria-describedby'],
      'data-disabled': dataAttr(root.disabled === true),
      'data-orientation': state.orientation ?? 'vertical',
    },
    checkbox: { name: root.name, disabled: root.disabled },
    named: ariaLabel !== undefined || ariaLabelledBy !== undefined,
    control: { ...control, group: true },
  };
}
