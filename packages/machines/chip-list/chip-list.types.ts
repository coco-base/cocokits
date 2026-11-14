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
 * @cckValue form-reset - The form was reset.
 */
export type ChipListChangeReason = 'add' | 'remove' | 'form-reset';

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
  /** The values, in the order they were added. */
  readonly value: readonly string[];
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
  /** What the hidden native inputs carry: `name`, `disabled`, `required` and one string per value. */
  readonly formInput: FormHiddenInputProps;
  /** Whether the chips the list renders are disabled: the list is disabled or read-only. */
  readonly chipDisabled: boolean;
  /** What the list reports to its FormField: the effective id and facts, with `filled` = a value or draft text. */
  readonly control: FormFieldControlState;
}
