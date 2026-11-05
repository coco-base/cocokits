import type { Component } from 'vue';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import type { AsTag, Direction, PointerDownOutsideEvent } from '@cocokits/vue-core';
import type { OverlayPositioningProps } from '../internal/overlay-positioning.types';

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
