import { toIdSegment, dataAttr } from '@cocokits/utils';
import {
  getFormFieldControlProps,
  mergeDescribedBy,
  type FormFieldControlContext,
  type FormFieldControlProps,
} from '../form-field';
import { selectIds, selectItemId, selectOptionDescriptionId } from './select-ids';
import { createSelectKeyDown } from './select-keyboard';
import { getSelectExtraParts, shownSelectKeys } from './select-search';
import { isSelectEmpty, isSelectItemVisible, isValueSelected, selectFormValues } from './select-values';
import { selectAnatomy } from './select.anatomy';
import type {
  SelectEvent,
  SelectGroupItem,
  SelectItem,
  SelectOptionGroupProps,
  SelectOptionProps,
  SelectParts,
  SelectState,
} from './select.types';

const groupLabelId = (id: string, key: string): string => `${id}-group-label-${toIdSegment(key)}`;

/** The trigger reports the highlighted option only while it keeps DOM focus: with a search, the search does. */
function triggerActiveId<T>(state: SelectState<T>): string | undefined {
  const active = state.items.find((item) => item.key === state.highlighted);
  return state.open && state.filter !== true && active ? selectItemId(state.id, active) : undefined;
}

/** A blur of the open trigger dismisses, except when the window lost focus or a search takes the focus on purpose. */
function shouldDismissOnBlur<T>(state: SelectState<T>, event: FocusEvent): boolean {
  return state.open && state.filter !== true && !windowLostFocus(event);
}

/** The group is hidden while a query shows none of its options (`shown` is `undefined` without a filter). */
function groupProps(
  id: string,
  group: SelectGroupItem,
  shown: ReadonlySet<string> | undefined,
): SelectOptionGroupProps {
  const noMatch = shown !== undefined && group.itemKeys !== undefined && !group.itemKeys.some((key) => shown.has(key));
  return {
    class: selectAnatomy.classes.optionGroup,
    role: 'group',
    'aria-labelledby': groupLabelId(id, group.key),
    'aria-disabled': group.disabled ? 'true' : undefined,
    'data-disabled': dataAttr(group.disabled),
    hidden: noMatch ? true : undefined,
  };
}

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
    'aria-describedby': item.hasDescription === true ? selectOptionDescriptionId(state.id, item) : undefined,
    hidden: isSelectItemVisible(state, item) ? undefined : true,
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
 * hint and error ids, and the facts of the field and of the Select add up. A blocked submit counts as invalid and
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
  const filtering = state.filter === true;
  const shown = shownSelectKeys(state);
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
      // With a search, DOM focus is in the search input and it reports the highlighted option.
      'aria-activedescendant': triggerActiveId(state),
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
        if (shouldDismissOnBlur(state, event)) send({ type: 'LIST.DISMISS', reason: 'blur', event });
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
      'data-empty': dataAttr(filtering && shown.size === 0),
      'data-side': state.side ?? 'bottom',
      'data-align': state.align ?? 'start',
      onMouseDown: (event) => {
        event.preventDefault();
      },
    },
    ...getSelectExtraParts(state, send, ids.content),
    separator: { class: classes.separator, 'aria-hidden': 'true' },
    optionIndicator: { class: classes.optionIndicator, 'aria-hidden': 'true' },
    optionContent: { class: classes.optionContent },
    option: (item) => optionProps(state, item, send),
    optionGroup: (group: SelectGroupItem) => groupProps(state.id, group, filtering ? shown : undefined),
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
