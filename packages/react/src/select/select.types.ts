import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode, RefCallback } from 'react';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import type { SelectOpenReason, SelectValueReason } from '@cocokits/machines/select';
import type { Direction } from '@cocokits/shared';
import type { CancelableChangeDetails } from '../internal/cancelable-change-details';
import type { PointerDownOutsideEvent } from '../internal/dismiss-handlers';
import type { OverlayPositioningProps } from '../internal/overlay-positioning.types';

export type { CancelableChangeDetails, PointerDownOutsideEvent, SelectOpenReason, SelectValueReason };

/**
 * What `onValueChange` receives besides the value: the reason (`'user'` or `'form-reset'`), the event behind it,
 * and `cancel()` to refuse the change.
 */
export type SelectChangeDetails = CancelableChangeDetails<SelectValueReason>;

/**
 * What `onOpenChange` receives besides the open state: the reason, the event behind it, and `cancel()` to refuse
 * the change. A close caused by focus leaving the trigger (reason `'blur'`) cannot be refused.
 */
export type SelectOpenChangeDetails = CancelableChangeDetails<SelectOpenReason>;

/**
 * The value of a Select: a `T` or `null` (nothing selected) for a single Select, a list of `T` with `multiple`.
 * `M` is the type of the `multiple` prop, so the value is a list exactly when `multiple` is on.
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

/** The `items` of a Select: a list of entries, or, for string values, a record from value to label. */
export type SelectItems<T = string> = readonly SelectItemData<T>[] | Readonly<Record<string, string>>;

/**
 * The props the function form of `render` receives: the native props merged with the part's own. Spread all of
 * them, including `ref`, onto one element.
 */
export interface SelectRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Any `data-*` attribute, such as `data-state` and the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The merged ref: the part's `ref`, the rendered element's own `ref` and the part's internal one. */
  readonly ref: RefCallback<HTMLElement>;
}

/** The `render` prop of a Select part: an element, or a function of the merged props. */
export type SelectRender = ReactElement | ((props: SelectRenderProps) => ReactElement);

/**
 * Props of the {@link SelectRoot}. Native `div` props pass through to the root element.
 *
 * @typeParam T - The type of an item's value. Defaults to `string`.
 * @typeParam M - The type of `multiple`: `true` makes the value a list. Defaults to `false`.
 */
export interface SelectRootProps<T = string, M extends boolean = false> extends Omit<
  ComponentPropsWithRef<'div'>,
  'color' | 'defaultValue' | 'onChange' | 'dir'
> {
  /**
   * The trigger and the list: a `Select.Trigger` and a `Select.Content`.
   *
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The selected value: a `T` or `null` for a single Select, a list of `T` with `multiple`. `null`, `''` and an
   * empty list mean nothing is selected. It makes the Select controlled: a parent that does not update it after
   * `onValueChange` keeps the old value.
   *
   * @cckSemantic select.value
   */
  readonly value?: SelectValueOf<T, M> | undefined;
  /**
   * The start value of an uncontrolled Select.
   *
   * @defaultValue null (an empty list with `multiple`)
   * @cckSemantic none
   * @remarks React's uncontrolled mode; Angular and Vue bind `value` as a model.
   */
  readonly defaultValue?: SelectValueOf<T, M> | undefined;
  /**
   * Called after every change of the value the user makes and after a form reset, with the new value (a list
   * with `multiple`, `null` when a clearing item was chosen) and the details. Never when the parent sets `value`.
   * Call `details.cancel()` to refuse the change: the value stays, and a choice made inside the list keeps the
   * list open.
   *
   * @cckSemantic select.valueChange
   * @remarks React's change callback (Base UI); Angular emits `selectionChange` and Vue `update:modelValue`.
   */
  readonly onValueChange?: ((value: SelectValueOf<T, M>, details: SelectChangeDetails) => void) | undefined;
  /**
   * Whether the list is open, which makes it controlled. A disabled or read-only Select never opens.
   *
   * @defaultValue false
   * @cckSemantic select.open
   */
  readonly open?: boolean | undefined;
  /**
   * The initial open state of an uncontrolled Select. The list mounts after hydration, so a Select that is open
   * by default renders closed on the server.
   *
   * @defaultValue false
   * @cckSemantic none
   * @remarks React's uncontrolled mode; Angular has the `open()` method and Vue binds `open` as a model.
   */
  readonly defaultOpen?: boolean | undefined;
  /**
   * Called after every open change the user makes: the trigger, Escape, a press outside, choosing an item or
   * focus leaving the trigger. Never when the parent sets `open`. Call `details.cancel()` to refuse the change
   * (not for reason `'blur'`).
   *
   * @cckSemantic select.openChange
   * @remarks React's change callback; Angular emits `openedChange` and Vue `update:open`.
   */
  readonly onOpenChange?: ((open: boolean, details: SelectOpenChangeDetails) => void) | undefined;
  /**
   * Whether several items can be selected. The value is then a list in the order the items were selected, and
   * choosing an item toggles it and keeps the list open.
   *
   * @defaultValue false
   */
  readonly multiple?: M | undefined;
  /**
   * The labels the trigger shows, from data: a list of `{ value, label }` entries, or, for string values, a
   * record from value to label. The trigger text is the label of each selected value joined with `, `, else
   * `itemToStringLabel(value)`, else `String(value)`. No part registers its text with the Select, so the label
   * is in the server render; the text of an item should equal its label. A closed Select also matches a browser
   * autofill against these entries.
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
   * Whether an item's value is the selected value. Use it when `T` is an object. It must treat its two
   * arguments alike: the order they arrive in is not fixed.
   *
   * @cckSemantic select.isItemEqual
   * @remarks Base UI's `isItemEqualToValue`; Angular has `compareWith` and Vue `by`.
   * @defaultValue Object.is
   */
  readonly isItemEqualToValue?: ((itemValue: T, value: T) => boolean) | undefined;
  /**
   * The `autocomplete` of the hidden inputs. A browser autofill that writes to them selects the matching enabled
   * item of a single Select. Without it they carry `autocomplete="off"`.
   *
   * @cckSemantic select.autocomplete
   * @remarks Radix's `autoComplete`; Vue spells it `autocomplete`.
   * @defaultValue 'off'
   */
  readonly autoComplete?: string | undefined;
  /**
   * Whether the Select is disabled. A disabling `fieldset` and the FormField's `disabled` add to it.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * Whether the Select is read-only: it stays focusable and never opens.
   *
   * @defaultValue false
   */
  readonly readOnly?: boolean | undefined;
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
   * The text direction of the Select and its list, like a `DirectionProvider`: `start` and `end` placement and
   * the portal host follow it. Without it the nearest `DirectionProvider` applies, then `'ltr'`. Only a `dir`
   * you pass is rendered on the root element.
   *
   * @cckSemantic none
   * @remarks Angular reads `Directionality` (no input).
   */
  readonly dir?: Direction | undefined;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props. The part keeps its role,
   * classes and `data-*`. The function form must spread all the props it receives, including `ref`, onto one
   * element.
   *
   * @cckSemantic none
   * @remarks React's element override (Base UI); Angular puts the directive on your element and Vue uses `asChild`.
   */
  readonly render?: SelectRender | undefined;
}

/** Props of the {@link SelectTrigger}. Native button props pass through, `aria-*` included. */
export interface SelectTriggerProps extends Omit<ComponentPropsWithRef<'button'>, 'color'> {
  /**
   * The content of the trigger: a `Select.Value` and a `Select.Icon`.
   *
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The accessible name of the Select. The list is named the same.
   *
   * @cckSemantic select.trigger.aria-label
   */
  readonly 'aria-label'?: string | undefined;
  /**
   * The id of the element that names the Select. The list is named the same.
   *
   * @cckSemantic select.trigger.aria-labelledby
   */
  readonly 'aria-labelledby'?: string | undefined;
  /**
   * The ids of the elements that describe the Select. They are added to the ids of the FormField.
   *
   * @cckSemantic select.trigger.aria-describedby
   */
  readonly 'aria-describedby'?: string | undefined;
  /**
   * Whether the rendered element is a native `<button>`. Set `false` when `render` gives another element: it
   * then gets `tabindex="0"` and no `type`. In development a tag that does not match logs a `CocoKits:` error.
   *
   * @defaultValue true
   * @cckSemantic none
   * @remarks React's element kind for `render` (Base UI); Vue decides it with `as`.
   */
  readonly nativeButton?: boolean | undefined;
  /**
   * Replaces the rendered `<button>`: an element such as `<Button />`, or a function of the merged props. The
   * function form must spread all the props it receives, including `ref`, onto one element. An element that is
   * not a `<button>` also needs `nativeButton={false}`.
   *
   * @cckSemantic none
   * @remarks React's element override (Base UI); Angular puts the directive on your element and Vue uses `as` or `asChild`.
   */
  readonly render?: SelectRender | undefined;
}

/**
 * Props of the {@link SelectValue}. Native `span` props pass through.
 *
 * @typeParam V - The type of the value the children function receives: `T | null`, or `readonly T[]` with `multiple`.
 */
export interface SelectValueProps<V = unknown> extends Omit<ComponentPropsWithRef<'span'>, 'color' | 'children'> {
  /**
   * The text shown while nothing is selected.
   *
   * @cckSemantic select.value.placeholder
   * @defaultValue ''
   */
  readonly placeholder?: string | undefined;
  /**
   * What to show in place of the labels while something is selected: a node, or a function of the value (a `T`,
   * or the list with `multiple`). It is not called while nothing is selected.
   *
   * @cckSemantic select.default
   * @remarks Base UI's `Value` children function; Angular uses `ng-template[cckSelectTrigger]` and Vue the default slot.
   */
  readonly children?: ReactNode | ((value: V) => ReactNode) | undefined;
  /**
   * Replaces the rendered `<span>`: an element, or a function of the merged props. The function form must spread
   * all the props it receives, including `ref`, onto one element.
   *
   * @cckSemantic none
   * @remarks React's element override (Base UI); Angular puts the directive on your element and Vue uses `as` or `asChild`.
   */
  readonly render?: SelectRender | undefined;
}

/** The `render` prop every part has; its TSDoc is repeated on each part's props. */
interface SelectRenderOption {
  /**
   * Replaces the rendered element: an element, or a function of the merged props. The part keeps its classes and
   * `data-*`. The function form must spread all the props it receives, including `ref`, onto one element.
   *
   * @cckSemantic none
   * @remarks React's element override (Base UI); Angular puts the directive on your element and Vue uses `as` or `asChild`.
   */
  readonly render?: SelectRender | undefined;
}

/** Props of the {@link SelectIcon}: native `span` props and `render`. Its content, if any, replaces the theme's icon. */
export interface SelectIconProps extends Omit<ComponentPropsWithRef<'span'>, 'color'>, SelectRenderOption {
  /**
   * The icon to draw in place of the theme's icon; empty keeps the theme's icon.
   *
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
}

/** Props of the {@link SelectItemText}: native `span` props and `render`. */
export interface SelectItemTextProps extends Omit<ComponentPropsWithRef<'span'>, 'color'>, SelectRenderOption {
  /**
   * The text of the item: what typeahead matches and the trigger shows. Never a control.
   *
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
}

/** Props of the {@link SelectItemIndicator}: native `span` props and `render`. */
export interface SelectItemIndicatorProps extends Omit<ComponentPropsWithRef<'span'>, 'color'>, SelectRenderOption {
  /**
   * A mark to draw in place of the theme's mark; empty keeps the theme's mark.
   *
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
}

/** Props of the {@link SelectLabel}: native `div` props and `render`. */
export interface SelectLabelProps extends Omit<ComponentPropsWithRef<'div'>, 'color'>, SelectRenderOption {
  /**
   * The label of the group: text or markup, never a control.
   *
   * @cckSemantic select.label
   */
  readonly children?: ReactNode | undefined;
}

/** Props of the {@link SelectSeparator}: native `div` props and `render`. */
export interface SelectSeparatorProps extends Omit<ComponentPropsWithRef<'div'>, 'color'>, SelectRenderOption {}

/** Props of the {@link SelectContent}. Native `div` props pass through. */
export interface SelectContentProps extends Omit<ComponentPropsWithRef<'div'>, 'color'>, OverlayPositioningProps {
  /**
   * The items, groups and separators.
   *
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The side of the trigger (or the field box) the list prefers. `start` and `end` follow the direction; it
   * flips when there is no room.
   *
   * @defaultValue 'bottom'
   * @cckSemantic select.content.side
   */
  readonly side?: OverlaySide | undefined;
  /**
   * How the list lines up along the anchor's edge.
   *
   * @defaultValue 'start'
   * @cckSemantic select.content.align
   */
  readonly align?: OverlayAlign | undefined;
  /**
   * Keeps the list in the document while the Select is closed, after hydration: it then has `hidden` and
   * `data-state="closed"`, and its items stay mounted. Nothing is rendered on the server. Closed, it has no dismiss
   * layer and no positioning.
   *
   * @defaultValue false
   * @cckSemantic select.content.forceMount
   * @remarks React and Vue only (Radix and Reka); Angular never keeps the list mounted.
   */
  readonly forceMount?: boolean | undefined;
  /**
   * Called when Escape is pressed with the list open, before it closes. Call `event.preventDefault()` to keep it
   * open. Refusing Escape weakens the pattern, because users expect it to close the list; keep the refusal
   * short-lived. Focus leaving the trigger is never refused.
   *
   * @cckSemantic none
   * @remarks React and Vue only (Radix and Reka); Angular refuses with `disableClose` on the root.
   */
  readonly onEscapeKeyDown?: ((event: KeyboardEvent) => void) | undefined;
  /**
   * Called when a pointer press lands outside the list and the trigger, before it closes. The press is
   * `event.detail.originalEvent`. Call `event.preventDefault()` to keep it open; the press then leaves the focus
   * on the trigger.
   *
   * @cckSemantic none
   * @remarks React and Vue only (Radix and Reka); Angular refuses with `disableClose` on the root.
   */
  readonly onPointerDownOutside?: ((event: PointerDownOutsideEvent) => void) | undefined;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props. The part keeps its role,
   * classes and `data-*`. The function form must spread all the props it receives, including `ref`, onto one
   * element.
   *
   * @cckSemantic none
   * @remarks React's element override (Base UI); Angular puts the directive on your element and Vue uses `as` or `asChild`.
   */
  readonly render?: SelectRender | undefined;
}

/**
 * Props of the {@link SelectItem}. Native `div` props pass through; its content must not be interactive.
 *
 * @typeParam T - The type of the value. Defaults to `string`.
 */
export interface SelectItemProps<T = string> extends Omit<ComponentPropsWithRef<'div'>, 'color' | 'children'> {
  /**
   * The value the item stands for. In a single Select an item whose value is `null` or `''` clears the value and
   * shows the placeholder.
   *
   * @cckSemantic select.option.value
   */
  readonly value: T | null;
  /**
   * Whether the item is disabled: it cannot be chosen and keys skip it. Its group adds to it.
   *
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * The text type-to-search matches. Without it the text of the `Select.ItemText` counts, else the label of the
   * value.
   *
   * @cckSemantic select.option.textValue
   * @remarks Radix's `textValue`; Angular matches the option text.
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
   * The content of the item: a `Select.ItemIndicator` and a `Select.ItemText`, never a control.
   *
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props. The part keeps its role,
   * classes and `data-*`. The function form must spread all the props it receives, including `ref`, onto one
   * element.
   *
   * @cckSemantic none
   * @remarks React's element override (Base UI); Angular puts the directive on your element and Vue uses `as` or `asChild`.
   */
  readonly render?: SelectRender | undefined;
}

/** Props of the {@link SelectGroup}. Native `div` props pass through. */
export interface SelectGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /**
   * Whether the group is disabled: its items cannot be chosen.
   *
   * @defaultValue false
   * @cckSemantic select.optionGroup.disabled
   */
  readonly disabled?: boolean | undefined;
  /**
   * A `Select.Label` and the items of the group.
   *
   * @cckSemantic select.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props. The part keeps its role,
   * classes and `data-*`. The function form must spread all the props it receives, including `ref`, onto one
   * element.
   *
   * @cckSemantic none
   * @remarks React's element override (Base UI); Angular puts the directive on your element and Vue uses `as` or `asChild`.
   */
  readonly render?: SelectRender | undefined;
}

/** A Select part: a function component with its `displayName`. */
export interface SelectPart<P> {
  (props: P): ReactElement;
  displayName: string;
}

/** The {@link SelectRoot}: a generic function component, `Select.Root<T, M>`, with its `displayName`. */
export interface SelectRootComponent {
  <T = string, M extends boolean = false>(props: SelectRootProps<T, M>): ReactElement;
  displayName: string;
}

/** The {@link SelectValue}: a generic function component, `Select.Value<V>`, with its `displayName`. */
export interface SelectValueComponent {
  <V = unknown>(props: SelectValueProps<V>): ReactElement;
  displayName: string;
}

/** The {@link SelectItem}: a generic function component, `Select.Item<T>`, with its `displayName`. */
export interface SelectItemComponent {
  <T = string>(props: SelectItemProps<T>): ReactElement;
  displayName: string;
}
