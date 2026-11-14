import { getFormFieldControlProps, isFilledText, type FormFieldControlContext } from '../form-field';
import { chipListAnatomy } from './chip-list.anatomy';
import type { ChipListKeyEvent, ChipListParts, ChipListProps } from './chip-list.types';

/**
 * Adds a typed text to a list of values. Pure: it never changes the list it gets.
 *
 * @param value - The current values.
 * @param text - The text the user confirmed. It is trimmed.
 * @returns The list with the text at the end; the same list, unchanged, when the trimmed text is empty or already
 * in the list (compare by reference to know whether anything changed).
 */
export function addChipListValue(value: readonly string[], text: string): readonly string[] {
  const trimmed = text.trim();
  return trimmed === '' || value.includes(trimmed) ? value : [...value, trimmed];
}

/**
 * Removes the value at one position. Pure: it never changes the list it gets. Only that position goes, so with
 * two equal values the other one stays.
 *
 * @param value - The current values.
 * @param index - The position of the chip whose remove button was activated.
 * @returns The list without that value; the same list, unchanged, when `index` is not a position in it.
 */
export function removeChipListValue(value: readonly string[], index: number): readonly string[] {
  return Number.isInteger(index) && index >= 0 && index < value.length ? value.filter((_, i) => i !== index) : value;
}

/**
 * Whether a keydown in the text box adds the typed text: Enter, with no Shift, Ctrl, Alt or Meta, and not while an
 * IME composition runs.
 *
 * @param event - The keydown.
 * @returns `true` when the key adds the text.
 */
export function isChipListAddKey(event: ChipListKeyEvent): boolean {
  const composing = event.isComposing === true || event.keyCode === 229;
  const modified = event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
  return event.key === 'Enter' && !composing && !modified;
}

/**
 * Computes the props of every Chip list part and the state it reports to its field. Pure: no DOM, same result on
 * the server and the client. The ten facts go to the root (the box); the input gets the id, the description, the
 * gated `aria-invalid`, native `disabled` and `readonly` and `aria-required`; `name` and the native `required`
 * go to the hidden inputs only (`formInput`), so an empty text box never blocks a submit while chips exist.
 *
 * @param state - The author's props and the tracked facts.
 * @param field - What the enclosing FormField gives the list; leave it out outside a field.
 * @returns The root, input and hidden-input props, and the control state for the field.
 */
export function getChipListProps(state: ChipListProps, field?: FormFieldControlContext): ChipListParts {
  const draft = state.draft ?? '';
  const filled = state.value.length > 0 || isFilledText(draft);
  const { root: control, control: reported } = getFormFieldControlProps({ ...state, filled }, field);
  const {
    id,
    name,
    disabled,
    readonly,
    required,
    'aria-invalid': ariaInvalid,
    'aria-describedby': described,
    ...facts
  } = control;
  return {
    root: { class: chipListAnatomy.classes.root, ...facts },
    input: {
      class: chipListAnatomy.classes.input,
      type: 'text',
      id,
      autocomplete: 'off',
      placeholder: state.placeholder === '' ? undefined : state.placeholder,
      disabled,
      readonly,
      'aria-required': required ? 'true' : undefined,
      'aria-invalid': ariaInvalid,
      'aria-describedby': described,
    },
    formInput: { name, disabled, required, values: state.value },
    chipDisabled: reported.disabled === true || reported.readOnly === true,
    control: reported,
  };
}
