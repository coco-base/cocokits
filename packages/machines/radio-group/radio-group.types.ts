import type { Direction } from '@cocokits/shared';

/**
 * Which arrow keys move through the radios. When not set, all four arrow keys do.
 *
 * @cckValue horizontal - ArrowLeft and ArrowRight move through the radios.
 * @cckValue vertical - ArrowUp and ArrowDown move through the radios.
 */
export type RadioGroupOrientation = 'horizontal' | 'vertical';

/**
 * Why the group value changed.
 *
 * @cckValue user - The user checked a radio.
 * @cckValue form-reset - The form was reset.
 */
export type RadioGroupChangeReason = 'user' | 'form-reset';

/** One registered radio, read in document order by the adapter. */
export interface RadioGroupItem {
  /**
   * The radio's submitted value, which identifies it. A radio without one can never be checked, is never
   * the tab stop and is skipped by the arrow keys.
   */
  readonly value?: string | undefined;
  /** The radio's own disabled state, including a disabling fieldset. @defaultValue false */
  readonly disabled?: boolean | undefined;
  /** The radio's own required state. @defaultValue false */
  readonly required?: boolean | undefined;
  /** The radio's own `form`; it wins over the group's. */
  readonly form?: string | undefined;
}

/** Inputs of `getRadioGroupProps` and `transitionRadioGroup`. */
export interface RadioGroupState {
  /** The group value (controlled or tracked); `null` or `undefined` checks no radio. */
  readonly value?: string | null | undefined;
  /** The shared native `name`: the author's or the one the adapter generated. An empty string is none. */
  readonly name?: string | undefined;
  /** The radios in document order. */
  readonly items: readonly RadioGroupItem[];
  /** Disables every radio and removes the tab stop. @defaultValue false */
  readonly disabled?: boolean | undefined;
  /** Requires one radio to be checked. @defaultValue false */
  readonly required?: boolean | undefined;
  /** The `form` for radios that have none of their own. */
  readonly form?: string | undefined;
  /** Limits the arrow keys to one axis; unset, both axes move. */
  readonly orientation?: RadioGroupOrientation | undefined;
  /** Whether the arrows wrap from the last radio to the first and back. @defaultValue true */
  readonly loop?: boolean | undefined;
  /** The text direction from the direction runtime; it flips the horizontal arrows only. @defaultValue 'ltr' */
  readonly dir?: Direction | undefined;
  /** `true` once the radios registered; before that no radio renders a `tabindex`. @defaultValue false */
  readonly mounted?: boolean | undefined;
}

/** The event the root key handler sends. */
export interface RadioGroupEvent {
  /** An arrow key moved to another enabled radio. */
  readonly type: 'RADIO.NAVIGATE';
  /** The value of the radio to move to. */
  readonly value: string;
  /** The key event. */
  readonly event: Event;
}

/** What the adapter does after an event. A missing key means nothing to do. */
export interface RadioGroupTransition {
  /** Focus the input of the radio with this value. */
  readonly focus?: string;
  /** Activate (click) the input of the radio with this value, so the native check and `change` run. */
  readonly activate?: string;
}

/** One handled key of the keymap. */
export interface RadioGroupKeyBinding {
  /** The keys. */
  readonly keys: readonly string[];
  /** The `key` text of the matching row of the meta keyboard table. */
  readonly row: string;
}

/** Props of the root part. Absent keys are `undefined`. */
export interface RadioGroupRootProps {
  /** The `cck-radio-group` block class. */
  readonly class: string;
  /** Always `'radiogroup'`. */
  readonly role: 'radiogroup';
  /** `'true'` while required. */
  readonly 'aria-required'?: 'true' | undefined;
  /** `'true'` while disabled. */
  readonly 'aria-disabled'?: 'true' | undefined;
  /** The orientation, only while it is set. */
  readonly 'aria-orientation'?: RadioGroupOrientation | undefined;
  /** Present (empty) while disabled. */
  readonly 'data-disabled'?: '' | undefined;
  /** Present (empty) while required. */
  readonly 'data-required'?: '' | undefined;
  /** The orientation, only while it is set. */
  readonly 'data-orientation'?: RadioGroupOrientation | undefined;
  /**
   * Sends `RADIO.NAVIGATE` for a handled arrow key and prevents its default; also prevents the default of
   * an arrow the orientation or the end of a non-looping group blocks.
   *
   * @param event - The keydown that reached the root.
   * @param current - The value of the radio that has focus; `undefined` when focus is not on a registered radio.
   */
  readonly onKeyDown: (event: KeyboardEvent, current: string | undefined) => void;
}

/** What the group gives one radio. Absent keys are `undefined`. */
export interface RadioGroupRadioFacts {
  /** Whether the group value equals the radio's value. */
  readonly checked: boolean;
  /** The shared name; absent when there is none. */
  readonly name?: string | undefined;
  /** Native `disabled`: the group's or the radio's own. */
  readonly disabled?: true | undefined;
  /** Native `required`: the group's or the radio's own. */
  readonly required?: true | undefined;
  /** The radio's own `form`, else the group's. */
  readonly form?: string | undefined;
  /** `0` on the single tab stop, `-1` on the other radios, absent before mount. */
  readonly tabIndex?: 0 | -1 | undefined;
}

/** What `getRadioGroupProps` returns. */
export interface RadioGroupParts {
  /** The root props. */
  readonly root: RadioGroupRootProps;
  /** The facts for one registered radio. */
  readonly radio: (item: RadioGroupItem) => RadioGroupRadioFacts;
}
