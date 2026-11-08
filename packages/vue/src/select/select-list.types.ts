import type { Component } from 'vue';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import type { AsTag, Direction, PointerDownOutsideEvent } from '@cocokits/vue-core';
import type { OverlayPositioningProps } from '../internal/overlay-positioning.types';

/**
 * The list of items. It renders a `<div role="listbox">` in the overlay container, not next to the trigger. It renders only while the Select is open, and while its exit animation runs.
 *
 * The focus stays on the trigger.
 *
 * It opens on `side` and `align`, and flips and shifts to stay in view. Put `SelectItem`, `SelectGroup` and `SelectSeparator` elements inside it. The theme sets the gap.
 *
 * @example
 * <SelectContent>
 *   <SelectItem value="Cake">
 *     <SelectItemIndicator />
 *     <SelectItemText>Cake</SelectItemText>
 *   </SelectItem>
 * </SelectContent>
 * @cckPart content
 */
export interface SelectContentProps extends OverlayPositioningProps {
  /**
   * The side of the trigger (or the field box) where the list prefers to open. `start` and `end` follow the text direction. The list opens on the other side when there is no room.
   * @cckSemantic select.content.side
   * @defaultValue 'bottom'
   */
  readonly side?: OverlaySide | undefined;
  /**
   * How the list lines up with the edge of the trigger.
   * @cckSemantic select.content.align
   * @defaultValue 'start'
   */
  readonly align?: OverlayAlign | undefined;
  /**
   * Whether the closed list stays in the document, hidden. Its items and their state are kept. It renders after hydration, so the server renders no list.
   *
   * When not set, the closed list is not in the document.
   *
   * @cckSemantic select.content.forceMount
   * @cckParity Not available in every framework.
   * @defaultValue false
   */
  readonly forceMount?: boolean | undefined;
  /**
   * The text direction of the list. The `start` and `end` placement and the overlay container follow it. When not set, the direction of the root applies.
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly dir?: Direction | undefined;
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The events of the `SelectContent`. Both can be refused: a listener that calls `preventDefault()` on its event (or is written with `.prevent`) keeps the list open. A focus leave is never refused: it chooses the highlighted item of a single Select and closes the list.
 */
export interface SelectContentEmits {
  /**
   * Emits when the user presses Escape with the list open, before it closes. The event is the keydown. Call `preventDefault()` to keep the list open.
   *
   * When not set, Escape closes the list.
   *
   * A Select that Escape cannot close is harder to leave with the keyboard. Keep the refusal short.
   *
   * @example
   * <SelectContent @escape-key-down.prevent>
   *   ...
   * </SelectContent>
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  escapeKeyDown: [event: KeyboardEvent];
  /**
   * Emits when the user presses outside the list and the trigger, before the list closes. The event is cancelable, and `detail.originalEvent` is the press. Call `preventDefault()` to keep the list open.
   *
   * The press then leaves the focus on the trigger.
   *
   * @example
   * <SelectContent @pointer-down-outside.prevent>
   *   ...
   * </SelectContent>
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  pointerDownOutside: [event: PointerDownOutsideEvent];
}

/**
 * One choice in the list. It renders a `<div role="option">`. Put a `SelectItemIndicator` and a `SelectItemText` inside it, and no control.
 *
 * A click chooses it, unless it is disabled. Native attributes and listeners fall through to it.
 *
 * @example
 * <SelectItem value="Cake">
 *   <SelectItemIndicator />
 *   <SelectItemText>Cake</SelectItemText>
 * </SelectItem>
 * @typeParam T - The type of the value. The default is `string`.
 * @cckPart option
 */
export interface SelectItemProps<T = string> {
  /**
   * The value of the item. The Select holds it when the user chooses the item. In a single Select, an item with the value `null` or `''` clears the value and shows the placeholder.
   * @cckSemantic select.option.value
   */
  readonly value: T;
  /**
   * Whether the item is disabled. The user cannot choose it, and keys skip it. A disabled group also disables it.
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * The text that type-to-search matches. When not set, the text of the `SelectItemText` counts, and then the label of the value.
   * @cckSemantic select.option.textValue
   * @cckParity Not available in every framework.
   */
  readonly textValue?: string | undefined;
  /**
   * The `id` of the item element. The trigger uses it as `aria-activedescendant` while the item is highlighted. When not set, an id is made for you.
   * @cckSemantic select.option.id
   * @defaultValue generated
   * @cckParity A native `id` on the item element.
   */
  readonly id?: string | undefined;
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The events of a `SelectItem`.
 */
export interface SelectItemEmits<T = string> {
  /**
   * Emits before the user chooses the item with a click, Enter or Space, or when the focus leaves the trigger on the highlighted item. The event is cancelable, and its `detail` holds the `originalEvent` and the `value`. Call `preventDefault()` to stop the choice.
   *
   * The value stays, and a list opened by a click or a key stays open.
   *
   * @example
   * <SelectItem value="Cake" @select.prevent>
   *   ...
   * </SelectItem>
   * @cckSemantic none
   * @cckParity The Item part emits it.
   */
  select: [event: CustomEvent<{ originalEvent: Event; value: T }>];
}

/**
 * The text of an item. It renders a `<span>`. Type-to-search matches its text, unless the item has a `textValue`.
 *
 * @example
 * <SelectItemText>Cake</SelectItemText>
 * @cckPart optionContent
 */
export interface SelectItemTextProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The mark that shows an item is selected: a check, or a box with `multiple`. It renders a `<span aria-hidden="true">`. Its look comes from the theme and from the `data-selected` of the item.
 *
 * @example
 * <SelectItemIndicator />
 * @cckPart optionIndicator
 */
export interface SelectItemIndicatorProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * A group of items with a label. It renders a `<div role="group">` that its `SelectLabel` names. Disabling the group disables every item in it.
 *
 * @example
 * <SelectGroup>
 *   <SelectLabel>Desserts</SelectLabel>
 *   <SelectItem value="Cake">
 *     <SelectItemIndicator />
 *     <SelectItemText>Cake</SelectItemText>
 *   </SelectItem>
 * </SelectGroup>
 * @cckPart optionGroup
 */
export interface SelectGroupProps {
  /**
   * Whether the group is disabled. The user cannot choose its items.
   * @cckSemantic select.optionGroup.disabled
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The label of a group. It renders a `<div>` that the group refers to with `aria-labelledby`. It must not be interactive.
 *
 * @example
 * <SelectLabel>Desserts</SelectLabel>
 * @cckPart optionGroupLabel
 */
export interface SelectLabelProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * A line between items or groups. It renders a `<div aria-hidden="true">`. Keys never stop on it.
 *
 * @example
 * <SelectSeparator />
 * @cckPart separator
 */
export interface SelectSeparatorProps {
  /**
   * The tag or component to render in place of the element of the part. The part keeps its role, state, ids and
   * handlers. It is ignored with `asChild`.
   *
   * When not set, the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first child element or component, instead of rendering its own element. The
   * child keeps its own props and gets the role, the classes and the `data-*` attributes of the part. When not set,
   * the part renders its own element.
   *
   * @cckShared
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
