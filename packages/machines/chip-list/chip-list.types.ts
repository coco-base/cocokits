import type {
  FormFieldControlProps,
  FormFieldControlState,
  FormFieldRootProps,
  FormHiddenInputProps,
} from '../form-field';

/**
 * Why the value changed.
 *
 * @cckValue add - The user added a value.
 * @cckValue remove - The user removed a value.
 * @cckValue toggle - The user toggled a selectable chip.
 * @cckValue form-reset - The form was reset.
 */
export type ChipListChangeReason = 'add' | 'remove' | 'toggle' | 'form-reset';

/**
 * One entry of the value list: an item object, or a plain string for a removable chip with no options.
 * An item with `selected` set is selectable.
 */
export interface ChipListItem {
  /** The text of the chip and the string the form submits. */
  readonly value: string;
  /** Whether the chip shows its remove button. @defaultValue true */
  readonly removable?: boolean | undefined;
  /** Whether the chip is disabled: no remove button and no toggle. @defaultValue false */
  readonly disabled?: boolean | undefined;
  /** The selected state of a selectable chip; the chip is not selectable while this is `undefined`. */
  readonly selected?: boolean | undefined;
}

/** One entry of the value list: a string, or a {@link ChipListItem}. */
export type ChipListEntry = string | ChipListItem;

/** What the list gives one chip: the same facts for a string and for an item object. */
export interface ChipListChipFacts {
  /** The text of the chip and the string the form submits. */
  readonly value: string;
  /** Whether the chip shows its remove button. */
  readonly removable: boolean;
  /** Whether the chip is disabled: the item's own, or the list's (disabled or read-only). */
  readonly disabled: boolean;
  /** The selected state; `undefined` while the chip is not selectable. */
  readonly selected: boolean | undefined;
}

/** Where focus goes after a chip is removed with the keyboard: a position in the list after the removal, or the text box. */
export type ChipListFocusTarget = number | 'input';

/** The keydown facts `isChipListAddKey` reads; a DOM `KeyboardEvent` fits. */
export interface ChipListKeyEvent {
  /** The key value, for example `'Enter'`. */
  readonly key: string;
  /** Shift is held. */
  readonly shiftKey: boolean;
  /** Ctrl is held. */
  readonly ctrlKey: boolean;
  /** Alt is held. */
  readonly altKey: boolean;
  /** Meta is held. */
  readonly metaKey: boolean;
  /** An IME composition is running. */
  readonly isComposing?: boolean | undefined;
  /** The legacy key code; `229` marks a key of a composition in some browsers. */
  readonly keyCode?: number | undefined;
}

/**
 * Inputs of `getChipListProps`: the shared control props (see {@link FormFieldControlProps}) plus the value, the
 * draft text and the placeholder. A missing fact is `false`.
 */
export interface ChipListProps extends Omit<FormFieldControlProps, 'filled'> {
  /** The entries, in the order they were added: strings and {@link ChipListItem} objects. */
  readonly value: readonly ChipListEntry[];
  /** The text in the text box that is not yet a value. @defaultValue '' */
  readonly draft?: string | undefined;
  /** The placeholder of the text box. An empty string counts as none. */
  readonly placeholder?: string | undefined;
}

/** Props of the root part: the class and the ten facts of the FormField root, with native `hidden`. */
export interface ChipListRootProps extends Omit<FormFieldRootProps, 'class'> {
  /** The `cck-chip-list` block class. */
  readonly class: string;
}

/** Props of the text box part. Absent keys are `undefined`. */
export interface ChipListInputProps {
  /** The `cck-chip-list__input` class. */
  readonly class: string;
  /** Always `'text'`. */
  readonly type: 'text';
  /** The author's id, or the control id inside a field. */
  readonly id?: string | undefined;
  /** Always `'off'`: the list suggests nothing. */
  readonly autocomplete: 'off';
  /** The placeholder. */
  readonly placeholder?: string | undefined;
  /** Native `disabled`. */
  readonly disabled?: true | undefined;
  /** Native `readonly`. */
  readonly readonly?: true | undefined;
  /** `'true'` while required; the native `required` sits on the hidden inputs, so an empty box does not block a submit. */
  readonly 'aria-required'?: 'true' | undefined;
  /** `'true'` only while invalid and (touched or submitted). */
  readonly 'aria-invalid'?: 'true' | undefined;
  /** The author's ids first, then the hint ids, then the error ids. */
  readonly 'aria-describedby'?: string | undefined;
}

/** What `getChipListProps` returns. */
export interface ChipListParts {
  /** The root props. */
  readonly root: ChipListRootProps;
  /** The text box props. */
  readonly input: ChipListInputProps;
  /** The facts of one chip, from its entry; a disabled or read-only list disables every chip. */
  readonly chip: (entry: ChipListEntry) => ChipListChipFacts;
  /** What the hidden native inputs carry: `name`, `disabled`, `required` and one string per value. */
  readonly formInput: FormHiddenInputProps;
  /** Whether the chips the list renders are disabled: the list is disabled or read-only. */
  readonly chipDisabled: boolean;
  /** What the list reports to its FormField: the effective id and facts, with `filled` = a value or draft text. */
  readonly control: FormFieldControlState;
}
