import type { Component } from 'vue';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import type { AsTag, Direction, PointerDownOutsideEvent } from '@cocokits/vue-core';
import type { SelectOpenReason, SelectValueReason } from '@cocokits/machines/select';
import type { OverlayPositioningProps } from '../internal/overlay-positioning.types';

export type { SelectOpenReason, SelectValueReason };

/**
 * The value of a Select: a `T` or `null` (nothing selected) for a single Select, a list of `T` with `multiple`.
 * `M` is the type of the `multiple` prop, so `v-model` is a list exactly when `multiple` is on.
 */
export type SelectValueOf<T = string, M extends boolean = false> = M extends true ? readonly T[] : T | null;

/** One entry of the `items` prop of a Select: a value, the label the trigger shows for it and whether it is disabled. */
export interface SelectItemData<T = string> {
  /** The value of the item. */
  readonly value: T;
  /** The text the trigger shows while the value is selected. */
  readonly label: string;
  /** Whether a closed Select refuses a browser autofill to this item. @defaultValue false */
  readonly disabled?: boolean | undefined;
}

/**
 * The `items` of a Select: a list of entries, or, for string values, a record from value to label.
 */
export type SelectItems<T = string> = readonly SelectItemData<T>[] | Readonly<Record<string, string>>;

/**
 * Groups the trigger, the list and the hidden form inputs of a custom listbox and holds the value and the open
 * state. It renders the root `<div>`; write the parts inside it: a `SelectTrigger` with a `SelectValue` and a
 * `SelectIcon`, and a `SelectContent` with `SelectItem`s. It is not a native `<select>`. The items mount with the
 * list, so the list renders nothing while closed, on the server and in the first client render.
 *
 * Bind the value with `v-model`: a `T` or `null`, or a list of `T` with `multiple`. `T` is `string` unless the
 * items carry something else, and then `itemToStringLabel`, `itemToStringValue` and `by` tell the Select how to
 * show, submit and compare it. With `name` (or `required`) it renders hidden native inputs, so `FormData`,
 * constraint validation, `form` and a form reset work. Inside a FormField the trigger is the field's control and
 * the list lines up with the field's input wrapper.
 *
 * @example
 * <SelectRoot v-model="dish">
 *   <SelectTrigger aria-label="Dish"><SelectValue placeholder="Choose a dish" /><SelectIcon /></SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="Cake"><SelectItemIndicator /><SelectItemText>Cake</SelectItemText></SelectItem>
 *     <SelectItem value="Pizza"><SelectItemIndicator /><SelectItemText>Pizza</SelectItemText></SelectItem>
 *   </SelectContent>
 * </SelectRoot>
 *
 * @typeParam T - The type of an item's value. Defaults to `string`.
 * @typeParam M - The type of `multiple`: `true` makes the value a list. Defaults to `false`.
 * @cckPart root
 */
export interface SelectRootProps<T = string, M extends boolean = false> {
  /**
   * The selected value, bound with `v-model`: a `T` or `null` for a single Select, a list of `T` with `multiple`.
   * `null`, `''` and an empty list mean nothing is selected. Bound with a listener it is controlled: a parent
   * that does not accept a change keeps the old value.
   *
   * @cckSemantic select.value
   * @remarks Vue's `v-model`.
   */
  readonly modelValue?: SelectValueOf<T, M> | undefined;
  /**
   * The modifiers of `v-model` Vue passes; the component only declares them so they do not reach the DOM.
   *
   * @cckSemantic none
   * @remarks Vue-only: Vue fills it from `v-model.trim` and the like.
   */
  readonly modelModifiers?: Record<string, true> | undefined;
  /**
   * The initial value of a Select whose `v-model` is not bound, read once when it is created. Binding
   * `modelValue` ignores it. A form reset restores it, and clears the Select when there is none.
   *
   * @cckSemantic none
   * @remarks Vue's uncontrolled start value, as React's `defaultValue`; Angular binds `value` as a model.
   */
  readonly defaultValue?: SelectValueOf<T, M> | undefined;
  /**
   * Whether the list is open, bound with `v-model:open`. A disabled or read-only Select never opens.
   *
   * @cckSemantic select.open
   * @remarks Vue's `v-model:open`.
   * @defaultValue false
   */
  readonly open?: boolean | undefined;
  /**
   * The modifiers of `v-model:open` Vue passes; the component only declares them so they do not reach the DOM.
   *
   * @cckSemantic none
   * @remarks Vue-only: Vue fills it from `v-model:open.trim` and the like.
   */
  readonly openModifiers?: Record<string, true> | undefined;
  /**
   * The initial open state of a Select whose `open` is not bound, read once when it is created. Binding `open`
   * ignores it. A disabled or read-only Select never opens.
   *
   * @cckSemantic none
   * @remarks Vue's uncontrolled start value, as React's `defaultOpen`; Angular has the `open()` method.
   * @defaultValue false
   */
  readonly defaultOpen?: boolean | undefined;
  /**
   * Whether several items can be selected. The value is then a list, and choosing an item toggles it and keeps
   * the list open. Values keep the order they were selected in.
   *
   * @defaultValue false
   */
  readonly multiple?: (M & boolean) | undefined;
  /**
   * The labels the trigger shows, from data: a list of `{ value, label }` entries, or, for string values, a
   * record from value to label. The trigger text is the label of each selected value joined with `, `, else
   * `itemToStringLabel(value)`, else `String(value)`. No part registers its text with the Select, so the label
   * is in the server render. A closed Select also matches a browser autofill against these entries. The text of
   * an item should equal its label.
   *
   * @cckSemantic select.items
   * @remarks Base UI's `items` with string labels; Angular reads the option text instead.
   */
  readonly items?: SelectItems<T> | undefined;
  /**
   * Turns a value into the text the trigger shows when `items` has no label for it, and the type-to-search text
   * of an item with no text.
   *
   * @cckSemantic select.itemToStringLabel
   * @remarks Base UI's `itemToStringLabel`; Angular reads the option text.
   * @defaultValue String
   */
  readonly itemToStringLabel?: ((value: T) => string) | undefined;
  /**
   * Turns a value into the string of the hidden form input. A browser autofill is matched through it.
   *
   * @cckSemantic select.itemToStringValue
   * @remarks Base UI's `itemToStringValue`.
   * @defaultValue String
   */
  readonly itemToStringValue?: ((value: T) => string) | undefined;
  /**
   * How an item's value is compared with the selected value: the name of a field to compare, or a function. Use
   * it when `T` is an object.
   *
   * @cckSemantic select.isItemEqual
   * @remarks Reka UI's `by`; React has `isItemEqualToValue` and Angular `compareWith`.
   * @defaultValue Object.is
   */
  readonly by?: string | ((a: T, b: T) => boolean) | undefined;
  /**
   * The `autocomplete` of the hidden inputs. A browser autofill that writes to them selects the matching enabled
   * item of a single Select. Without it they carry `autocomplete="off"`.
   *
   * @cckSemantic select.autocomplete
   * @remarks Reka UI's `autocomplete`; React has `autoComplete`.
   * @defaultValue 'off'
   */
  readonly autocomplete?: string | undefined;
  /**
   * What the hidden input of a single Select carries while nothing is selected.
   *
   * @cckSemantic none
   * @remarks Vue only (Reka UI's `nullableValue`).
   * @defaultValue ''
   */
  readonly nullableValue?: string | undefined;
  /**
   * Disables the Select. A disabling `fieldset` and the field's `disabled` add to it.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Makes the Select read-only: it stays focusable and never opens.
   *
   * @cckSemantic select.readOnly
   * @remarks Vue spells it as the native `readonly` attribute.
   * @defaultValue false
   */
  readonly readonly?: boolean | undefined;
  /**
   * Whether a value is required (native `required` on the hidden input, `aria-required` on the trigger).
   *
   * @defaultValue false
   */
  readonly required?: boolean | undefined;
  /**
   * Whether the Select is invalid. `aria-invalid` waits for a blur or a submit attempt.
   *
   * @defaultValue false
   */
  readonly invalid?: boolean | undefined;
  /**
   * The `name` `FormData` submits. Without it and without `required` no hidden input renders.
   *
   * @cckSemantic select.name
   * @defaultValue ''
   */
  readonly name?: string | undefined;
  /**
   * The id of the form the hidden inputs belong to (native `form`), for a Select outside its form.
   */
  readonly form?: string | undefined;
  /**
   * The text direction of the Select: the keys and the nested parts follow it, and the root renders the `dir`
   * attribute only when you pass one. Without it the nearest `provideDirection` applies, else `'ltr'`. A
   * `SelectContent` can take its own.
   *
   * @cckSemantic none
   * @remarks Angular reads `Directionality` (no input).
   */
  readonly dir?: Direction | undefined;
  /**
   * Whether the root merges onto its first element or component child instead of rendering a `div`. The child
   * keeps the role, the classes and the `data-*` markers of the part, and its children go inside it.
   *
   * @cckSemantic none
   * @remarks Vue's merge onto one child; React's `render` and Angular's attribute selector do the same.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/** The events of the SelectRoot. */
export interface SelectRootEmits<T = string, M extends boolean = false> {
  /**
   * Emits with the new value for `v-model`, after every change the Select accepts: a `T` or `null` (a clearing
   * item), or the list with `multiple`.
   *
   * @cckSemantic select.valueChange
   * @remarks Vue's change event is the `v-model` update event, as in Reka UI; it carries no reason. Angular emits
   * `selectionChange` and React calls `onValueChange`.
   */
  'update:modelValue': [value: SelectValueOf<T, M>];
  /**
   * Emits with the new open state for `v-model:open`, after every change the Select accepts.
   *
   * @cckSemantic select.openChange
   * @remarks Vue's change event is the `v-model:open` update event, as in Reka UI; it carries no reason. Angular
   * emits `openedChange` and React calls `onOpenChange`.
   */
  'update:open': [open: boolean];
}

/**
 * The `button` with the combobox role that shows the selection and opens the list. It gets `aria-expanded`,
 * `aria-haspopup="listbox"` and, while the list is mounted, `aria-controls`. Name it with the label of a
 * FormField, or with `aria-label` or `aria-labelledby` (the list takes the same name); `aria-describedby` joins
 * the ids of the field. Native button attributes and listeners fall through to it.
 *
 * @example
 * <SelectTrigger aria-label="Dish"><SelectValue placeholder="Choose a dish" /><SelectIcon /></SelectTrigger>
 *
 * @cckPart trigger
 */
export interface SelectTriggerProps {
  /**
   * The tag or component to render, in place of the `button`. The part keeps its role, state, ids and handlers.
   * A tag or component other than `button` gets `tabindex="0"` and no `type`. Ignored with `asChild`.
   *
   * @cckSemantic none
   * @remarks Vue's element override (Reka).
   * @defaultValue 'button'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the trigger merges onto its first element or component child (a `Button`) instead of rendering a
   * `button`. The child keeps its own props except the ARIA and `data-state` markers.
   *
   * @cckSemantic none
   * @remarks Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * What the trigger shows: the placeholder while nothing is selected, the selected labels otherwise. It renders the
 * `span` of the placeholder or of the value. Give the default slot to show something else than the labels.
 *
 * @example
 * <SelectValue placeholder="Choose a dish" />
 *
 * @cckPart value
 * @cckPart placeholder
 */
export interface SelectValueProps {
  /**
   * The text shown while nothing is selected.
   *
   * @cckSemantic select.value.placeholder
   * @defaultValue ''
   */
  readonly placeholder?: string | undefined;
  /**
   * The tag or component to render, in place of the `span`. Ignored with `asChild`.
   *
   * @cckSemantic none
   * @remarks Vue's element override (Reka).
   * @defaultValue 'span'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first element or component child instead of rendering a `span`.
   *
   * @cckSemantic none
   * @remarks Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The decorative dropdown icon, a `span` with `aria-hidden`. Its content, if any, replaces the theme's icon.
 *
 * @example
 * <SelectIcon />
 *
 * @cckPart dropdownIcon
 */
export interface SelectIconProps {
  /**
   * The tag or component to render, in place of the `span`. Ignored with `asChild`.
   *
   * @cckSemantic none
   * @remarks Vue's element override (Reka).
   * @defaultValue 'span'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first element or component child instead of rendering a `span`.
   *
   * @cckSemantic none
   * @remarks Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The `listbox` of the items. It renders in the overlay container, not next to the trigger, only while the Select
 * is open (and while its exit animation runs). DOM focus stays on the trigger. The theme sets the gap.
 *
 * @example
 * <SelectContent><SelectItem value="Cake">…</SelectItem></SelectContent>
 *
 * @cckPart content
 */
export interface SelectContentProps extends OverlayPositioningProps {
  /**
   * The side of the trigger (or the field box) the list prefers. `start` and `end` follow the direction; it
   * flips when there is no room.
   *
   * @cckSemantic select.content.side
   * @defaultValue 'bottom'
   */
  readonly side?: OverlaySide | undefined;
  /**
   * How the list lines up along the anchor's edge.
   *
   * @cckSemantic select.content.align
   * @defaultValue 'start'
   */
  readonly align?: OverlayAlign | undefined;
  /**
   * Whether the list stays in the document while the Select is closed, so its items and their state are kept. It is
   * `hidden` while closed, and has no dismissal or positioning then. It renders after hydration: the server renders
   * no list.
   *
   * @cckSemantic select.content.forceMount
   * @remarks React and Vue only (Radix and Reka); Angular removes the list when it closes.
   * @defaultValue false
   */
  readonly forceMount?: boolean | undefined;
  /**
   * The text direction of the list: the `start` and `end` placement and the overlay container follow it. Without
   * it the root's applies.
   *
   * @cckSemantic none
   * @remarks Angular reads `Directionality` (no input).
   */
  readonly dir?: Direction | undefined;
  /**
   * The tag or component to render, in place of the `div`. The part keeps its role, state, ids and handlers.
   * Ignored with `asChild`.
   *
   * @cckSemantic none
   * @remarks Vue's element override (Reka).
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the list merges onto its first element or component child instead of rendering a `div`.
   *
   * @cckSemantic none
   * @remarks Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The events of the SelectContent. Both are cancelable: a listener that calls `preventDefault()` on its event (or
 * is written with `.prevent`) refuses the dismissal and the list stays open with its highlight. Refusing Escape
 * weakens the pattern, because users expect it to close the list; keep the refusal short-lived. Focus leaving the
 * trigger (Tab, a script) is never refused: it chooses the highlighted item of a single Select and closes.
 *
 * @example
 * <SelectContent @escape-key-down.prevent>…</SelectContent>
 */
export interface SelectContentEmits {
  /**
   * Emits before Escape closes the list, with the keydown. Call `preventDefault()` to keep it open.
   *
   * @cckSemantic none
   * @remarks Vue's Content emit (Reka UI); React has the `onEscapeKeyDown` handler and Angular `disableClose`.
   */
  escapeKeyDown: [event: KeyboardEvent];
  /**
   * Emits before a press outside closes the list, with a cancelable event whose `detail.originalEvent` is the
   * press. Call `preventDefault()` to keep it open; the press then leaves the focus on the trigger.
   *
   * @cckSemantic none
   * @remarks Vue's Content emit (Reka UI); React has the `onPointerDownOutside` handler and Angular `disableClose`.
   */
  pointerDownOutside: [event: PointerDownOutsideEvent];
}

/**
 * One choice: a `<div role="option">`. Put a `SelectItemIndicator` and a `SelectItemText` inside it, never a
 * control. A click chooses it unless it is disabled. Native attributes and listeners fall through to it.
 *
 * @example
 * <SelectItem value="Cake"><SelectItemIndicator /><SelectItemText>Cake</SelectItemText></SelectItem>
 *
 * @typeParam T - The type of the value. Defaults to `string`.
 * @cckPart option
 */
export interface SelectItemProps<T = string> {
  /**
   * The value the item stands for. In a single Select an item whose value is `null` or `''` clears the value.
   *
   * @cckSemantic select.option.value
   */
  readonly value: T;
  /**
   * Whether the item is disabled: it cannot be chosen and keys skip it. Its group adds to it.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * The text type-to-search matches. Without it the text of the `SelectItemText` counts, else the label of the
   * value.
   *
   * @cckSemantic select.option.textValue
   * @remarks Radix's and Reka UI's `textValue`; Angular matches the option text.
   */
  readonly textValue?: string | undefined;
  /**
   * The id of the item element, also the trigger's `aria-activedescendant` while it is highlighted. Without it
   * one is made.
   *
   * @cckSemantic select.option.id
   * @defaultValue generated
   * @remarks Material's option `id`.
   */
  readonly id?: string | undefined;
  /**
   * The tag or component to render, in place of the `div`. The part keeps its role, state, ids and handlers.
   * Ignored with `asChild`.
   *
   * @cckSemantic none
   * @remarks Vue's element override (Reka).
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the item merges onto its first element or component child instead of rendering a `div`.
   *
   * @cckSemantic none
   * @remarks Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The events of a SelectItem.
 *
 * @example
 * <SelectItem value="Cake" @select.prevent>…</SelectItem>
 */
export interface SelectItemEmits<T = string> {
  /**
   * Emits before the item is chosen (a click, Enter, Space, or the highlighted item when focus leaves the
   * trigger), with a cancelable event whose `detail` holds the `originalEvent` and the `value`. Call
   * `preventDefault()` to stop the choice: the value stays, and a list opened by a click or a key stays open.
   *
   * @cckSemantic none
   * @remarks Vue's item emit (Reka UI); React cancels in `onValueChange` and Angular has no value veto.
   */
  select: [event: CustomEvent<{ originalEvent: Event; value: T }>];
}

/**
 * The text of an item, in a `span`. Type-to-search matches it unless the item has a `textValue`.
 *
 * @example
 * <SelectItemText>Cake</SelectItemText>
 *
 * @cckPart optionContent
 */
export interface SelectItemTextProps {
  /**
   * The tag or component to render, in place of the `span`. Ignored with `asChild`.
   *
   * @cckSemantic none
   * @remarks Vue's element override (Reka).
   * @defaultValue 'span'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first element or component child instead of rendering a `span`.
   *
   * @cckSemantic none
   * @remarks Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The decorative mark of an item (a check, or a box with `multiple`), a `span` with `aria-hidden`. Its look
 * comes from the theme and the `data-selected` of the item.
 *
 * @example
 * <SelectItemIndicator />
 *
 * @cckPart optionIndicator
 */
export interface SelectItemIndicatorProps {
  /**
   * The tag or component to render, in place of the `span`. Ignored with `asChild`.
   *
   * @cckSemantic none
   * @remarks Vue's element override (Reka).
   * @defaultValue 'span'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first element or component child instead of rendering a `span`.
   *
   * @cckSemantic none
   * @remarks Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * A group of items: a `<div role="group">` named by its `SelectLabel`. Disabling the group disables every item in
 * it. Native attributes and listeners fall through to it.
 *
 * @example
 * <SelectGroup><SelectLabel>Desserts</SelectLabel><SelectItem value="Cake">…</SelectItem></SelectGroup>
 *
 * @cckPart optionGroup
 */
export interface SelectGroupProps {
  /**
   * Whether the group is disabled: its items cannot be chosen.
   *
   * @cckSemantic select.optionGroup.disabled
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * The tag or component to render, in place of the `div`. The part keeps its role and ids. Ignored with
   * `asChild`.
   *
   * @cckSemantic none
   * @remarks Vue's element override (Reka).
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the group merges onto its first element or component child instead of rendering a `div`.
   *
   * @cckSemantic none
   * @remarks Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The label of a group, in a `div`; the group refers to it with `aria-labelledby`. It must not be interactive.
 *
 * @example
 * <SelectLabel>Desserts</SelectLabel>
 *
 * @cckPart optionGroupLabel
 */
export interface SelectLabelProps {
  /**
   * The tag or component to render, in place of the `div`. Ignored with `asChild`.
   *
   * @cckSemantic none
   * @remarks Vue's element override (Reka).
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first element or component child instead of rendering a `div`.
   *
   * @cckSemantic none
   * @remarks Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * A decorative line between items or groups, a `div` with `aria-hidden`. Keys never land on it.
 *
 * @example
 * <SelectSeparator />
 *
 * @cckPart separator
 */
export interface SelectSeparatorProps {
  /**
   * The tag or component to render, in place of the `div`. Ignored with `asChild`.
   *
   * @cckSemantic none
   * @remarks Vue's element override (Reka).
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first element or component child instead of rendering a `div`.
   *
   * @cckSemantic none
   * @remarks Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
