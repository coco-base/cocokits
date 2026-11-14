import type { Component } from 'vue';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import type { MenuChangeReason } from '@cocokits/machines/menu';
import type { AsTag, FocusOutsideEvent, PointerDownOutsideEvent } from '@cocokits/vue-core';

export type { MenuChangeReason };

/**
 * Groups a trigger and its content, and holds the open state. It renders no element, so write the parts directly
 * inside it. Bind the state with `v-model:open`.
 *
 * @example
 * <MenuRoot>
 *   <MenuTrigger>Actions</MenuTrigger>
 *   <MenuContent>
 *     <MenuItem @select="rename">Rename</MenuItem>
 *     <MenuItem disabled>Delete</MenuItem>
 *   </MenuContent>
 * </MenuRoot>
 *
 * @cckPart root
 */
export interface MenuRootProps {
  /**
   * Whether the menu is open, bound with `v-model:open`. When not set, the menu keeps its own state, which starts
   * as `defaultOpen`.
   *
   * If you listen for changes and do not accept one, the old value stays. A menu that is open on the server renders
   * its content after hydration.
   *
   * @cckSemantic menu.open
   * @cckParity Bound with `v-model:open`.
   * @defaultValue false
   */
  readonly open?: boolean | undefined;
  /**
   * The modifiers of `v-model:open`. The framework fills it. The component declares it so the modifiers do not
   * reach the DOM.
   *
   * @internal
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly openModifiers?: Record<string, true> | undefined;
  /**
   * The start open state of a menu whose `open` is not bound. It is read once, when the menu is created. A bound
   * `open` ignores it.
   *
   * The content mounts after hydration, so a menu that starts open renders closed on the server.
   *
   * @cckSemantic none
   * @cckParity The value the component starts with.
   * @defaultValue false
   */
  readonly defaultOpen?: boolean | undefined;
}

/** The events of the MenuRoot. */
export interface MenuRootEmits {
  /**
   * Emits the new open state for `v-model:open` after every change the menu accepts. It carries no reason.
   *
   * To refuse a change, a parent that bound `v-model:open` keeps its own value.
   *
   * @cckSemantic menu.openChange
   * @cckParity The `update:open` event is the only change event; it carries no reason. A parent that bound `v-model:open` keeps its own value to refuse a change.
   */
  'update:open': [open: boolean];
}

/**
 * The `<button>` that opens and closes the menu. It gets `aria-haspopup="menu"` and `aria-expanded`, and
 * `aria-controls` while the content is mounted. It needs text or `aria-label`: the menu takes its name from it.
 *
 * Native button attributes and listeners fall through to it. A click listener that calls `preventDefault()` keeps
 * the menu as it is. ArrowDown opens the menu on its first item and ArrowUp on its last.
 *
 * With `as` or `asChild`, the element must be or render a `<button>`.
 *
 * @example
 * <MenuTrigger>Actions</MenuTrigger>
 *
 * @cckPart trigger
 */
export interface MenuTriggerProps {
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
 * The `menu` of actions, placed next to the trigger. It renders in the overlay container, not next to the trigger,
 * and only while the menu is open and while its exit animation runs.
 *
 * The focus moves to the first item on open (the last one after ArrowUp) and back to the trigger when the menu
 * closes. The arrow keys move between the items, Home and End go to the first and last item, and typing finds an
 * item by its text. Tab closes the menu and moves on. The menu is not modal: a press outside closes it and reaches
 * what lies under it.
 *
 * The trigger names the menu. `aria-label` or `aria-labelledby` on the content wins.
 *
 * Call `preventDefault()` in a listener of `escapeKeyDown`, `pointerDownOutside`, `focusOutside` or
 * `interactOutside` to keep the menu open, or write the listener with `.prevent`. A refused focus-out moves
 * nothing: the user can still Tab out of the menu.
 *
 * @example
 * <MenuContent side="end" align="start">
 *   <MenuItem>Rename</MenuItem>
 * </MenuContent>
 *
 * @cckPart content
 */
export interface MenuContentProps {
  /**
   * The side of the trigger the content opens on. `start` and `end` follow the direction. The content moves to the
   * opposite side when there is no room, and `data-side` gives the side it ended on.
   *
   * @cckSemantic menu.content.side
   * @cckParity The same name in every framework.
   * @defaultValue 'bottom'
   */
  readonly side?: OverlaySide | undefined;
  /**
   * How the content lines up along the edge of the trigger. It moves to stay in view, and `data-align` gives the
   * result.
   *
   * @cckSemantic menu.content.align
   * @cckParity The same name in every framework.
   * @defaultValue 'start'
   */
  readonly align?: OverlayAlign | undefined;
  /**
   * The gap in pixels between the trigger and the content. When not set, the content takes the `--side-offset` value
   * of the theme.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly sideOffset?: number | undefined;
  /**
   * How far, in pixels, the content moves along the edge of the trigger, away from the aligned edge. It has no
   * effect with `align="center"`.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue 0
   */
  readonly alignOffset?: number | undefined;
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

/** The events of the MenuContent. */
export interface MenuContentEmits {
  /**
   * Emits before Escape closes the menu, with the keydown event. Call `preventDefault()` to keep the menu open.
   *
   * A press outside, moving the focus away, an item and the trigger still close it.
   *
   * @example
   * <MenuContent @escape-key-down="(event) => saving && event.preventDefault()">...</MenuContent>
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  escapeKeyDown: [event: KeyboardEvent];
  /**
   * Emits before a press outside closes the menu. The `detail.originalEvent` of the event is the press. Call
   * `preventDefault()` to keep the menu open.
   *
   * @example
   * <MenuContent @pointer-down-outside="(event) => event.preventDefault()">...</MenuContent>
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  pointerDownOutside: [event: PointerDownOutsideEvent];
  /**
   * Emits before the focus moving outside closes the menu. The `detail.originalEvent` of the event is the focus
   * event. Call `preventDefault()` to keep the menu open.
   *
   * @example
   * <MenuContent @focus-outside.prevent>...</MenuContent>
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  focusOutside: [event: FocusOutsideEvent];
  /**
   * Emits after `pointerDownOutside` or `focusOutside`, with the same event, before the menu closes. Call
   * `preventDefault()` to keep the menu open.
   *
   * @example
   * <MenuContent @interact-outside="(event) => dirty && event.preventDefault()">...</MenuContent>
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  interactOutside: [event: PointerDownOutsideEvent | FocusOutsideEvent];
}

/**
 * One action of the menu. It renders a `<div>` with `role="menuitem"`. Write the text and any icon inside it; the
 * text is what typing finds.
 *
 * A click, or Enter or Space on the focused item, runs it. It emits `select`, then the menu closes and the focus goes
 * back to the trigger. Call `preventDefault()` on the `select` event to keep the menu open.
 *
 * A disabled item has `aria-disabled="true"` and stays focusable, so the arrow keys reach it. It runs nothing.
 *
 * To make an item a link, use `asChild` with a link: Enter and Space click it, so the link is followed.
 *
 * @example
 * <MenuItem @select="(event) => { event.preventDefault(); toggleGrid(); }">Show grid</MenuItem>
 *
 * @example
 * <MenuItem as-child><a href="/settings">Settings</a></MenuItem>
 *
 * @cckPart item
 */
export interface MenuItemProps {
  /**
   * Whether the item is disabled. A disabled item stays in the menu and keeps focus, and runs nothing.
   *
   * @cckSemantic menu.item.disabled
   * @cckParity The same name in every framework.
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

/** The events of the MenuItem. */
export interface MenuItemEmits {
  /**
   * Emits when the item runs, with a cancelable event that is not the click. Call `preventDefault()` to keep the menu
   * open. A disabled item emits nothing.
   *
   * @example
   * <MenuItem @select="(event) => event.preventDefault()">Show grid</MenuItem>
   *
   * @cckSemantic menu.item.activate
   * @cckParity The Item part emits it.
   */
  select: [event: Event];
}
