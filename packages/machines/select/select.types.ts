import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import type { Typeahead } from '@cocokits/cdk/roving-focus';
import type { FormFieldControlProps, FormFieldControlState, FormHiddenInputProps } from '../form-field';

/**
 * Why the open state changed.
 *
 * @cckValue trigger - The user pressed the trigger.
 * @cckValue escape - The user pressed Escape.
 * @cckValue outside-press - The user pressed outside the list.
 * @cckValue select - The user chose an item.
 * @cckValue blur - The focus left the trigger.
 */
export type SelectOpenReason = 'trigger' | 'escape' | 'outside-press' | 'select' | 'blur';

/**
 * Why the value changed.
 *
 * @cckValue user - The user chose an item.
 * @cckValue form-reset - The form was reset.
 */
export type SelectValueReason = 'user' | 'form-reset';

/** The side of the trigger (or field box) the list sits on. `start` and `end` follow the direction. */
export type SelectSide = OverlaySide;

/** How the list lines up along the anchor's edge. */
export type SelectAlign = OverlayAlign;

/** One registered option, read in document order by the adapter. */
export interface SelectItem<T = string> {
  /** A stable key from the registration (the adapter's generated id), never derived from the value. */
  readonly key: string;
  /** The option's value. */
  readonly value: T;
  /** Disabled by the option or by its group: it cannot be chosen and keys skip it. @defaultValue false */
  readonly disabled?: boolean | undefined;
  /** The id of the option element. @defaultValue made from the Select id and `key` */
  readonly id?: string | undefined;
  /**
   * The text the trigger shows for the option when it is selected. An adapter that cannot read it from the option's
   * content leaves it out. Without it the machine falls back to `itemToStringLabel(value)`, then `String(value)`.
   */
  readonly label?: string | undefined;
  /** The text typeahead matches, for example a `textValue`; without it the machine matches `label`. */
  readonly text?: string | undefined;
}

/** One registered option group. */
export interface SelectGroupItem {
  /** A stable key from the registration. */
  readonly key: string;
  /** The group is disabled; its options are disabled in `items`. @defaultValue false */
  readonly disabled?: boolean | undefined;
}

/** Inputs of `getSelectProps` and `transitionSelect`. The control facts are those of every form-field control. */
export interface SelectState<T = string> extends Omit<FormFieldControlProps, 'id' | 'filled'> {
  /** The SSR-stable id of the Select, from the adapter. */
  readonly id: string;
  /** The open model. */
  readonly open: boolean;
  /**
   * Whether the list is in the document: `open`, or closed with an exit animation still running.
   * @defaultValue the value of `open`
   */
  readonly mounted?: boolean | undefined;
  /**
   * Whether the list is kept in the document while closed and its exit animation is over (force-mounted): the
   * list is then hidden with the native `hidden` attribute.
   * @defaultValue false
   */
  readonly keptClosed?: boolean | undefined;
  /** The options in document order. */
  readonly items: readonly SelectItem<T>[];
  /** The key of the highlighted option (the active descendant); `undefined` when none is. */
  readonly highlighted?: string | undefined;
  /** The value: a `T`, or a list of `T` with `multiple`. `undefined`, `null` and `''` are an empty single value. */
  readonly value?: T | readonly T[] | null | undefined;
  /** Several values can be selected. @defaultValue false */
  readonly multiple?: boolean | undefined;
  /** Turns a value into its label when no option gives one: the trigger text and the typeahead fallback. @defaultValue String */
  readonly itemToStringLabel?: ((value: T) => string) | undefined;
  /** Turns a value into the string the hidden form input submits. @defaultValue String */
  readonly itemToStringValue?: ((value: T) => string) | undefined;
  /**
   * An option whose value is `null` or `undefined` is selected like any other instead of clearing a single
   * Select. @defaultValue false
   */
  readonly canSelectNullableOptions?: boolean | undefined;
  /**
   * Orders the values of a multiple Select after a toggle, for an adapter that keeps option order.
   * Without it values keep selection order.
   */
  readonly orderValues?: ((values: readonly T[]) => readonly T[]) | undefined;
  /** Decides whether an option's value is the selected one. @defaultValue Object.is */
  readonly isItemEqual?: ((a: T, b: T) => boolean) | undefined;
  /** The id (or ids) of the element that labels the Select; for example the FormField label. */
  readonly labelledBy?: string | undefined;
  /** The author's `aria-label`. */
  readonly ariaLabel?: string | undefined;
  /** The resolved side, from the adapter's placement state. @defaultValue 'bottom' */
  readonly side?: SelectSide | undefined;
  /** The resolved alignment, from the adapter's placement state. @defaultValue 'start' */
  readonly align?: SelectAlign | undefined;
  /** The type-to-find buffer of this Select (`createTypeahead` of cdk `roving-focus`). Without it printable keys do nothing. */
  readonly typeahead?: Typeahead | undefined;
  /**
   * A form submit was blocked by the Select's constraint validation (required and empty). It counts as invalid and
   * submitted, and the trigger is described by the validation message element. The adapter clears it on the next
   * value change and on a form reset. @defaultValue false
   */
  readonly blockedSubmit?: boolean | undefined;
}

/** Where the highlight starts when the list opens. */
export type SelectInitialHighlight = 'selected' | 'first' | 'last' | { readonly key: string };

/** The events the handlers send. */
export type SelectEvent =
  | { readonly type: 'TRIGGER.CLICK'; readonly event: Event }
  /** A key opened the list. */
  | { readonly type: 'TRIGGER.OPEN'; readonly initial: SelectInitialHighlight; readonly event: Event }
  /** A key moved the highlight while the list is open. */
  | { readonly type: 'LIST.MOVE'; readonly key: string; readonly event: Event }
  /** The pointer moved over an option. */
  | { readonly type: 'OPTION.POINTER_MOVE'; readonly key: string; readonly event: Event }
  /** An option was clicked. */
  | { readonly type: 'OPTION.CLICK'; readonly key: string; readonly event: Event }
  /** Enter or Space chose the highlighted option. */
  | { readonly type: 'LIST.CHOOSE'; readonly event: Event }
  /** Alt+ArrowUp chose the highlighted option and closes (reason `select`). */
  | { readonly type: 'LIST.CHOOSE_AND_CLOSE'; readonly event: Event }
  /**
   * The list closes. Focus leaving the trigger (`blur`, or `outside-press` with `focusLeft`) first chooses the
   * highlighted enabled option of a single Select; Escape and an outside press that kept focus never choose.
   */
  | {
      readonly type: 'LIST.DISMISS';
      readonly reason: 'escape' | 'outside-press' | 'blur';
      readonly event: Event | null;
      /** An outside press moved focus off the trigger. Always true for `blur`. @defaultValue false */
      readonly focusLeft?: boolean | undefined;
    };

/** What the adapter does after an event. A missing key means nothing to do. */
export interface SelectTransition<T = string> {
  /** The open change to report (reason as given). */
  readonly open?: { readonly open: boolean; readonly reason: SelectOpenReason };
  /** The new highlighted key; `null` clears it. */
  readonly highlight?: string | null;
  /** Scroll the highlighted option into view at the nearest edge (a keyboard move or an open). */
  readonly reveal?: boolean;
  /** The new value to report (reason `'user'`): a `T`, a list with `multiple`, or `null` when a clearing option was chosen. */
  readonly value?: T | readonly T[] | null;
}

/** The ids of the parts that link to each other. */
export interface SelectIds {
  /** The trigger id (the control id inside a FormField). */
  readonly trigger: string;
  /** The list id. */
  readonly content: string;
  /** The id of the visually hidden element that holds the browser's validation message of a blocked submit. */
  readonly validationMessage: string;
}

/** Props of the validation message element. The adapter renders it, visually hidden, while a submit is blocked. */
export interface SelectValidationMessageProps {
  /** The id the trigger's `aria-describedby` points at. */
  readonly id: string;
}

/** Props shared by every part. */
export interface SelectPartProps {
  /** The part's class from the anatomy. */
  readonly class: string;
}

/** Props of the decorative parts. */
export interface SelectDecorativeProps extends SelectPartProps {
  /** Always `'true'`. */
  readonly 'aria-hidden': 'true';
}

/** Props of the root. Absent keys are `undefined`. */
export interface SelectRootProps extends SelectPartProps {
  /** `open` or `closed`. */
  readonly 'data-state': 'open' | 'closed';
  /** Present with `multiple`. */
  readonly 'data-multiple'?: '' | undefined;
  /** Present while disabled (by the Select or its field). */
  readonly 'data-disabled'?: '' | undefined;
  /** Present while read-only. */
  readonly 'data-readonly'?: '' | undefined;
  /** Present while required. */
  readonly 'data-required'?: '' | undefined;
  /** Present while invalid (raw, before the touched gate). */
  readonly 'data-invalid'?: '' | undefined;
  /** Present while nothing is selected. */
  readonly 'data-placeholder-shown'?: '' | undefined;
}

/** Props of the trigger, a `button` with the combobox role. Absent keys are `undefined`. */
export interface SelectTriggerProps extends SelectPartProps {
  /** The trigger id. */
  readonly id: string;
  /** Always `'button'`. */
  readonly type: 'button';
  /** Always `'combobox'`. */
  readonly role: 'combobox';
  /** Always `'listbox'`. */
  readonly 'aria-haspopup': 'listbox';
  /** The open state, always rendered. */
  readonly 'aria-expanded': 'true' | 'false';
  /** The list id, only while the list is mounted. */
  readonly 'aria-controls'?: string | undefined;
  /** The highlighted option's id, only while open. */
  readonly 'aria-activedescendant'?: string | undefined;
  /** The label ids. */
  readonly 'aria-labelledby'?: string | undefined;
  /** The author's label. */
  readonly 'aria-label'?: string | undefined;
  /** `'true'` while read-only. */
  readonly 'aria-readonly'?: 'true' | undefined;
  /** `'true'` while required. */
  readonly 'aria-required'?: 'true' | undefined;
  /** `'true'` only while invalid and (touched or submitted). */
  readonly 'aria-invalid'?: 'true' | undefined;
  /** The author's ids first, then the field's hint ids, then its error ids. */
  readonly 'aria-describedby'?: string | undefined;
  /** Native `disabled`. */
  readonly disabled?: true | undefined;
  /** `open` or `closed`. */
  readonly 'data-state': 'open' | 'closed';
  /** Sends `TRIGGER.CLICK` unless a consumer handler vetoed the click. */
  readonly onClick: (event: Event) => void;
  /** Sends the event of a handled key and prevents its default. */
  readonly onKeyDown: (event: KeyboardEvent) => void;
  /** Prevents the click a Space key up would raise; the key down already acted. */
  readonly onKeyUp: (event: KeyboardEvent) => void;
  /** Sends `LIST.DISMISS` with reason `blur` while open, unless the window lost focus and focus stays here. */
  readonly onBlur: (event: FocusEvent) => void;
}

/** Props of the list. Absent keys are `undefined`. */
export interface SelectContentProps extends SelectPartProps {
  /** The list id. */
  readonly id: string;
  /** Always `'listbox'`. */
  readonly role: 'listbox';
  /** `'true'` with `multiple`. */
  readonly 'aria-multiselectable'?: 'true' | undefined;
  /** The label ids. */
  readonly 'aria-labelledby'?: string | undefined;
  /** The author's label. */
  readonly 'aria-label'?: string | undefined;
  /** `true` while the closed list is kept mounted (native `hidden`); otherwise absent. */
  readonly hidden?: true | undefined;
  /** `open` or `closed`. */
  readonly 'data-state': 'open' | 'closed';
  /** Present with `multiple`. */
  readonly 'data-multiple'?: '' | undefined;
  /** The resolved side. */
  readonly 'data-side': SelectSide;
  /** The resolved alignment. */
  readonly 'data-align': SelectAlign;
  /** Prevents the default, so a press in the list keeps DOM focus on the trigger. */
  readonly onMouseDown: (event: Event) => void;
}

/** Props of one option. Absent keys are `undefined`. */
export interface SelectOptionProps extends SelectPartProps {
  /** The option's own `id`, else one made from the Select id and the option key. */
  readonly id: string;
  /** Always `'option'`. */
  readonly role: 'option';
  /** `'true'` on a selected option, `'false'` otherwise. */
  readonly 'aria-selected': 'true' | 'false';
  /** `'true'` on a disabled option. */
  readonly 'aria-disabled'?: 'true' | undefined;
  /** Present on a selected option. */
  readonly 'data-selected'?: '' | undefined;
  /** Present on the highlighted option. */
  readonly 'data-highlighted'?: '' | undefined;
  /** Present on a disabled option. */
  readonly 'data-disabled'?: '' | undefined;
  /** Sends `OPTION.CLICK` unless disabled or vetoed. */
  readonly onClick: (event: Event) => void;
  /** Sends `OPTION.POINTER_MOVE` unless disabled. */
  readonly onPointerMove: (event: Event) => void;
}

/** Props of an option group. Absent keys are `undefined`. */
export interface SelectOptionGroupProps extends SelectPartProps {
  /** Always `'group'`. */
  readonly role: 'group';
  /** The id of the group's label. */
  readonly 'aria-labelledby': string;
  /** `'true'` on a disabled group. */
  readonly 'aria-disabled'?: 'true' | undefined;
  /** Present on a disabled group. */
  readonly 'data-disabled'?: '' | undefined;
}

/** Props of an option group label. */
export interface SelectOptionGroupLabelProps extends SelectPartProps {
  /** The label id the group refers to. */
  readonly id: string;
}

/**
 * What the hidden native inputs of the Select need; the adapter renders one per value. The shape is the one
 * every control with hidden inputs shares: {@link FormHiddenInputProps}.
 */
export type SelectFormInputProps = FormHiddenInputProps;

/** What `getSelectProps` returns. */
export interface SelectParts<T = string> {
  /** The root props. */
  readonly root: SelectRootProps;
  /** The trigger props. */
  readonly trigger: SelectTriggerProps;
  /** The placeholder props (shown while nothing is selected). */
  readonly placeholder: SelectPartProps;
  /** The value props (shown while something is selected). */
  readonly value: SelectPartProps;
  /** The decorative dropdown icon props. */
  readonly dropdownIcon: SelectDecorativeProps;
  /** The list props. */
  readonly content: SelectContentProps;
  /** The decorative separator props. */
  readonly separator: SelectDecorativeProps;
  /** The decorative option indicator props. */
  readonly optionIndicator: SelectDecorativeProps;
  /** The option content props. */
  readonly optionContent: SelectPartProps;
  /** The props of one option. */
  readonly option: (item: SelectItem<T>) => SelectOptionProps;
  /** The props of one option group. */
  readonly optionGroup: (group: SelectGroupItem) => SelectOptionGroupProps;
  /** The props of the label of one option group. */
  readonly optionGroupLabel: (group: SelectGroupItem) => SelectOptionGroupLabelProps;
  /** What the hidden native inputs carry. */
  readonly formInput: SelectFormInputProps;
  /** The validation message element props; render the element only while `blockedSubmit` holds. */
  readonly validationMessage: SelectValidationMessageProps;
  /** What the Select reports to its FormField: the effective id and facts, with `filled` = has a value. */
  readonly control: FormFieldControlState;
}

/** One handled key of the keymap. */
export interface SelectKeyBinding {
  /** `KeyboardEvent.key` values; empty for `typeahead`, which is any single printable character. */
  readonly keys: readonly string[];
  /** Whether the list is closed, open, or either. */
  readonly when: 'closed' | 'open' | 'both';
  /** `'yes'`: Alt must be held; `'no'`: it must not; `'either'`: it may be. */
  readonly alt: 'yes' | 'no' | 'either';
  /** What the key does. */
  readonly intent:
    | 'open-selected'
    | 'open-first'
    | 'edge'
    | 'step'
    | 'page'
    | 'choose'
    | 'choose-close'
    | 'tab'
    | 'escape'
    | 'typeahead';
  /** The `key` text of the matching row of the meta keyboard table. */
  readonly row: string;
}
