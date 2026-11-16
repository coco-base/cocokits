import { getFormFieldControlProps, isFilledText, type FormFieldControlContext } from '../form-field';
import { chipListAnatomy } from './chip-list.anatomy';
import type {
  ChipListChipFacts,
  ChipListEntry,
  ChipListFocusTarget,
  ChipListKeyEvent,
  ChipListParts,
  ChipListProps,
} from './chip-list.types';

/** The text of an entry: the string itself, or the `value` of an item object. */
const textOf = (entry: ChipListEntry): string => (typeof entry === 'string' ? entry : entry.value);

/**
 * The facts of one chip from its entry. A string is a removable chip with no options; an item object defaults
 * `removable` to `true`, `disabled` to `false` and is selectable only with `selected` set.
 *
 * @param entry - A string or an item object.
 * @param listDisabled - Whether the list disables every chip (the list is disabled or read-only).
 * @returns The facts to give the Chip.
 */
export function getChipListChipFacts(entry: ChipListEntry, listDisabled = false): ChipListChipFacts {
  if (typeof entry === 'string') return { value: entry, removable: true, disabled: listDisabled, selected: undefined };
  return {
    value: entry.value,
    removable: entry.removable !== false,
    disabled: listDisabled || entry.disabled === true,
    selected: entry.selected,
  };
}

/** Whether a chip holds a focus stop: its remove button or its toggle, while it is enabled. */
function isFocusable(entry: ChipListEntry): boolean {
  const chip = getChipListChipFacts(entry);
  return !chip.disabled && (chip.removable || chip.selected !== undefined);
}

/**
 * Adds a typed text to a list of entries. Pure: it never changes the list it gets.
 *
 * @param value - The current entries.
 * @param text - The text the user confirmed. It is trimmed.
 * @returns The list with the text, as a string, at the end; the same list, unchanged, when the trimmed text is
 * empty or already the value of an entry (compare by reference to know whether anything changed).
 */
export function addChipListValue(value: readonly ChipListEntry[], text: string): readonly ChipListEntry[] {
  const trimmed = text.trim();
  return trimmed === '' || value.some((entry) => textOf(entry) === trimmed) ? value : [...value, trimmed];
}

/**
 * Removes the entry at one position. Pure: it never changes the list it gets. Only that position goes, so with
 * two equal values the other one stays. An entry that is not removable or is disabled stays.
 *
 * @param value - The current entries.
 * @param index - The position of the chip whose remove button was activated.
 * @returns The list without that entry; the same list, unchanged, when `index` is not a position in it or the
 * entry cannot be removed.
 */
export function removeChipListValue(value: readonly ChipListEntry[], index: number): readonly ChipListEntry[] {
  const entry = Number.isInteger(index) ? value[index] : undefined;
  if (entry === undefined) return value;
  const chip = getChipListChipFacts(entry);
  return chip.removable && !chip.disabled ? value.filter((_, i) => i !== index) : value;
}

/**
 * Toggles the `selected` of the entry at one position. Pure: it never changes the list it gets.
 *
 * @param value - The current entries.
 * @param index - The position of the selectable chip that was pressed.
 * @returns The list with that item replaced by a copy with `selected` flipped; the same list, unchanged, when
 * `index` is not a position, or the entry is a string, not selectable or disabled.
 */
export function toggleChipListItem(value: readonly ChipListEntry[], index: number): readonly ChipListEntry[] {
  const entry = Number.isInteger(index) ? value[index] : undefined;
  if (entry === undefined || typeof entry === 'string') return value;
  if (entry.selected === undefined || entry.disabled === true) return value;
  return value.map((candidate, i) => (i === index ? { ...entry, selected: !entry.selected } : candidate));
}

const hasModifier = (event: ChipListKeyEvent): boolean =>
  event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;

const isComposing = (event: ChipListKeyEvent): boolean => event.isComposing === true || event.keyCode === 229;

/**
 * Where Backspace in the text box sends focus: the last chip that holds a focus stop, but only while the text
 * box is empty, and not during an IME composition or with a modifier.
 *
 * @param event - The keydown in the text box.
 * @param draft - The text in the text box.
 * @param value - The current entries.
 * @returns The position of the chip to focus, or `null` when the key does nothing (the browser deletes a
 * character as usual).
 */
export function getChipListBackspaceTarget(
  event: ChipListKeyEvent,
  draft: string,
  value: readonly ChipListEntry[],
): number | null {
  if (event.key !== 'Backspace' || draft !== '' || isComposing(event) || hasModifier(event)) return null;
  const last = value.findLastIndex(isFocusable);
  return last < 0 ? null : last;
}

/**
 * What Backspace or Delete does on a focused chip: removes it. `null` for any other key, an IME composition or
 * a modifier.
 *
 * @param event - The keydown on a chip.
 * @returns The key that removes the chip, or `null`.
 */
export function getChipListRemoveKey(event: ChipListKeyEvent): 'Backspace' | 'Delete' | null {
  if (isComposing(event) || hasModifier(event)) return null;
  return event.key === 'Backspace' || event.key === 'Delete' ? event.key : null;
}

/**
 * Where focus goes after Backspace or Delete removes a chip: Backspace to the previous chip that holds a focus
 * stop, Delete to the next one, else the text box.
 *
 * @param value - The entries before the removal.
 * @param index - The position of the chip that is removed.
 * @param key - The key that removes it.
 * @returns A position in the list after the removal, or `'input'`.
 */
export function getChipListFocusAfterRemove(
  value: readonly ChipListEntry[],
  index: number,
  key: 'Backspace' | 'Delete',
): ChipListFocusTarget {
  if (key === 'Backspace') {
    const before = value.slice(0, Math.max(index, 0)).findLastIndex(isFocusable);
    return before < 0 ? 'input' : before;
  }
  const after = value.findIndex((entry, i) => i > index && isFocusable(entry));
  return after < 0 ? 'input' : after - 1;
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
  const chipDisabled = reported.disabled === true || reported.readOnly === true;
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
    formInput: { name, disabled, required, values: state.value.map(textOf) },
    chip: (entry) => getChipListChipFacts(entry, chipDisabled),
    chipDisabled,
    control: reported,
  };
}
