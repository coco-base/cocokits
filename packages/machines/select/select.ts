import { toIdSegment, dataAttr } from '@cocokits/utils';
import {
  getFormFieldControlProps,
  mergeDescribedBy,
  type FormFieldControlContext,
  type FormFieldControlProps,
} from '../form-field';
import { createSelectKeyDown } from './select-keyboard';
import { isSelectEmpty, isValueSelected, selectFormValues } from './select-values';
import { selectAnatomy } from './select.anatomy';
import type {
  SelectEvent,
  SelectGroupItem,
  SelectIds,
  SelectItem,
  SelectOptionProps,
  SelectParts,
  SelectState,
} from './select.types';

/**
 * Derives the ids of the Select parts that link to each other.
 *
 * @param id - The id of the Select, from the adapter.
 * @param controlId - The control id a FormField gives the trigger; leave it out outside a field.
 * @returns The trigger, list and validation message ids.
 */
export function selectIds(id: string, controlId?: string): SelectIds {
  return { trigger: controlId ?? `${id}-trigger`, content: `${id}-content`, validationMessage: `${id}-validation` };
}

/**
 * The id of one option. It is made from the registration key, never from the option's value.
 *
 * @param id - The id of the Select.
 * @param key - The option's registration key.
 * @returns The option id.
 */
export function selectOptionId(id: string, key: string): string {
  return `${id}-option-${toIdSegment(key)}`;
}

/**
 * The id of one option element: the option's own `id`, else the one made from the Select id and the key.
 *
 * @param id - The id of the Select.
 * @param item - The option (its `key` and optional `id`).
 * @returns The element id, also the trigger's `aria-activedescendant` while it is highlighted.
 */
export function selectItemId(id: string, item: Pick<SelectItem<unknown>, 'key' | 'id'>): string {
  return item.id ?? selectOptionId(id, item.key);
}

const groupLabelId = (id: string, key: string): string => `${id}-group-label-${toIdSegment(key)}`;

function optionProps<T>(
  state: SelectState<T>,
  item: SelectItem<T>,
  send: (event: SelectEvent) => void,
): SelectOptionProps {
  const selected = isValueSelected(state, item.value);
  const disabled = item.disabled === true;
  return {
    class: selectAnatomy.classes.option,
    id: selectItemId(state.id, item),
    role: 'option',
    'aria-selected': selected ? 'true' : 'false',
    'aria-disabled': disabled ? 'true' : undefined,
    'data-selected': dataAttr(selected),
    'data-highlighted': dataAttr(state.highlighted === item.key),
    'data-disabled': dataAttr(disabled),
    onClick: (event) => {
      if (!disabled && !event.defaultPrevented) send({ type: 'OPTION.CLICK', key: item.key, event });
    },
    onPointerMove: (event) => {
      if (!disabled) send({ type: 'OPTION.POINTER_MOVE', key: item.key, event });
    },
  };
}

/**
 * Whether a blur is the window losing focus: the element is still the document's active element. Focus did not
 * leave the trigger, so the list stays open and nothing is chosen.
 */
function windowLostFocus(event: FocusEvent): boolean {
  const target = event.target as { ownerDocument?: { activeElement: unknown } } | null;
  return target?.ownerDocument?.activeElement === target;
}

/** The list is named by the author's id, else by `aria-label`, else by the Label of the field. */
function listLabelledBy(
  state: Pick<SelectState, 'labelledBy' | 'ariaLabel'>,
  field?: FormFieldControlContext,
): string | undefined {
  return state.labelledBy ?? (state.ariaLabel === undefined ? field?.ids?.label : undefined);
}

/** The control facts: the author's, plus what a blocked submit adds (invalid, submitted, the message in the description). */
function controlProps<T>(state: SelectState<T>, filled: boolean): FormFieldControlProps {
  if (state.blockedSubmit !== true) return { ...state, id: undefined, filled };
  return {
    ...state,
    id: undefined,
    filled,
    invalid: true,
    submitted: true,
    ariaDescribedBy: mergeDescribedBy(state.ariaDescribedBy, selectIds(state.id).validationMessage),
  };
}

/**
 * Computes the props of every Select part and the state it reports to its field. Pure: no DOM, same
 * result on the server and the client. The handlers send events; they compute nothing while the props
 * are computed. The Select is the control of its FormField: the trigger takes the control id and the
 * feedback id, and the facts of the field and of the Select add up. A blocked submit counts as invalid and
 * submitted, and the message element joins the trigger's description.
 *
 * @param state - The author's props and the tracked facts.
 * @param send - Receives the events of the handlers; pass them to `transitionSelect`.
 * @param field - What the enclosing FormField gives the Select; leave it out outside a field.
 * @returns The props of each part (a function for each option and option group) and the control state.
 */
export function getSelectProps<T = string>(
  state: SelectState<T>,
  send: (event: SelectEvent) => void,
  field?: FormFieldControlContext,
): SelectParts<T> {
  const { classes } = selectAnatomy;
  const empty = isSelectEmpty(state);
  const { root, control } = getFormFieldControlProps(controlProps(state, !empty), field);
  const ids = selectIds(state.id, root.id);
  const dataState = state.open ? 'open' : 'closed';
  const multiple = dataAttr(state.multiple);
  const interactive = !root.disabled && !root.readonly;
  const active = state.items.find((item) => item.key === state.highlighted);
  return {
    root: {
      class: classes.root,
      'data-state': dataState,
      'data-multiple': multiple,
      'data-disabled': root['data-disabled'],
      'data-readonly': root['data-readonly'],
      'data-required': root['data-required'],
      'data-invalid': root['data-invalid'],
      'data-placeholder-shown': dataAttr(empty),
    },
    trigger: {
      class: classes.trigger,
      id: ids.trigger,
      type: 'button',
      role: 'combobox',
      'aria-haspopup': 'listbox',
      'aria-expanded': state.open ? 'true' : 'false',
      'aria-controls': (state.mounted ?? state.open) ? ids.content : undefined,
      'aria-activedescendant': state.open && active ? selectItemId(state.id, active) : undefined,
      'aria-labelledby': state.labelledBy,
      'aria-label': state.ariaLabel,
      'aria-readonly': root.readonly ? 'true' : undefined,
      'aria-required': root.required ? 'true' : undefined,
      'aria-invalid': root['aria-invalid'],
      'aria-describedby': root['aria-describedby'],
      disabled: root.disabled,
      'data-state': dataState,
      onClick: (event) => {
        if (interactive && !event.defaultPrevented) send({ type: 'TRIGGER.CLICK', event });
      },
      onKeyDown: createSelectKeyDown(state as SelectState<unknown>, { interactive }, send),
      onKeyUp: (event) => {
        if (event.key === ' ') event.preventDefault();
      },
      onBlur: (event) => {
        if (state.open && !windowLostFocus(event)) send({ type: 'LIST.DISMISS', reason: 'blur', event });
      },
    },
    placeholder: { class: classes.placeholder },
    value: { class: classes.value },
    dropdownIcon: { class: classes.dropdownIcon, 'aria-hidden': 'true' },
    content: {
      class: classes.content,
      id: ids.content,
      role: 'listbox',
      'aria-multiselectable': state.multiple ? 'true' : undefined,
      'aria-labelledby': listLabelledBy(state, field),
      'aria-label': state.ariaLabel,
      hidden: state.keptClosed ? true : undefined,
      'data-state': dataState,
      'data-multiple': multiple,
      'data-side': state.side ?? 'bottom',
      'data-align': state.align ?? 'start',
      onMouseDown: (event) => {
        event.preventDefault();
      },
    },
    separator: { class: classes.separator, 'aria-hidden': 'true' },
    optionIndicator: { class: classes.optionIndicator, 'aria-hidden': 'true' },
    optionContent: { class: classes.optionContent },
    option: (item) => optionProps(state, item, send),
    optionGroup: (group: SelectGroupItem) => ({
      class: classes.optionGroup,
      role: 'group',
      'aria-labelledby': groupLabelId(state.id, group.key),
      'aria-disabled': group.disabled ? 'true' : undefined,
      'data-disabled': dataAttr(group.disabled),
    }),
    optionGroupLabel: (group: SelectGroupItem) => ({
      class: classes.optionGroupLabel,
      id: groupLabelId(state.id, group.key),
    }),
    formInput: {
      name: root.name,
      disabled: root.disabled,
      required: root.required,
      values: selectFormValues(state),
    },
    validationMessage: { id: ids.validationMessage },
    control,
  };
}
