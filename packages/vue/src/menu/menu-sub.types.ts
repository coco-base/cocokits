import type { Component } from 'vue';
import type { AsTag, FocusOutsideEvent, PointerDownOutsideEvent } from '@cocokits/vue-core';

/**
 * Groups a sub-trigger and its sub-content, and holds the open state of the submenu. It renders no element: write it inside a `MenuContent`, as an item of the menu, and put the parts directly inside it. Bind the state with `v-model:open`.
 *
 * The submenu opens when the pointer rests on the sub-trigger, and with ArrowRight (ArrowLeft in right-to-left), Enter
 * and Space on it. It closes when the pointer moves to another item of the parent menu. It also closes with ArrowLeft
 * (ArrowRight in right-to-left) and Escape, and the focus goes back to the sub-trigger. A press on an item closes the
 * whole menu.
 *
 * @example
 * <MenuSub>
 *   <MenuSubTrigger>Share</MenuSubTrigger>
 *   <MenuSubContent>
 *     <MenuItem>Email</MenuItem>
 *   </MenuSubContent>
 * </MenuSub>
 *
 * @cckPart sub
 */
export interface MenuSubProps {
  /**
   * Whether the submenu is open, bound with `v-model:open`. When not set, the submenu keeps its own state, which
   * starts as `defaultOpen`.
   *
   * If you listen for changes and do not accept one, the old value stays.
   *
   * @cckSemantic menu.sub.open
   * @cckParity Bound with `v-model:open`.
   * @defaultValue false
   */
  readonly open?: boolean | undefined;
  /**
   * The modifiers of `v-model:open`. The framework fills it. The component declares it so the modifiers do not reach
   * the DOM.
   *
   * @internal
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly openModifiers?: Record<string, true> | undefined;
  /**
   * The start open state of a submenu whose `open` is not bound. It is read once, when the submenu is created.
   *
   * @cckSemantic none
   * @cckParity The value the component starts with.
   * @defaultValue false
   */
  readonly defaultOpen?: boolean | undefined;
}

/** The events of the MenuSub. */
export interface MenuSubEmits {
  /**
   * Emits the new open state for `v-model:open` after every change the submenu accepts. It carries no reason.
   *
   * @cckSemantic menu.sub.openChange
   * @cckParity The `update:open` event is the only change event; it carries no reason.
   */
  'update:open': [open: boolean];
}

/**
 * The item of the menu that opens a submenu. It renders a `<div>` with `role="menuitem"`, `aria-haspopup="menu"` and `aria-expanded`. Write it inside a `MenuSub`.
 *
 * @remarks A press on it opens the submenu and does not close the menu.
 *
 * @example
 * <MenuSubTrigger>Share</MenuSubTrigger>
 *
 * @cckPart subTrigger
 */
export interface MenuSubTriggerProps {
  /**
   * Whether the sub-trigger is disabled. It stays in the menu and keeps focus, and never opens the submenu.
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

/**
 * The `menu` of a submenu, placed at the bottom-end corner of its sub-trigger. It renders in the overlay container and only while the submenu is open and while its exit animation runs. With no room it flips to the start side of the sub-trigger, then above it.
 *
 * The focus moves to the first item when a key opens it, and back to the sub-trigger when the submenu closes. The
 * sub-trigger names it.
 *
 * @example
 * <MenuSubContent>
 *   <MenuItem>Email</MenuItem>
 * </MenuSubContent>
 *
 * @cckPart subContent
 */
export interface MenuSubContentProps {
  /**
   * The gap in pixels between the sub-trigger and the content. When not set, the content takes the `--side-offset`
   * value of the theme.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly sideOffset?: number | undefined;
  /**
   * How far, in pixels, the content moves along the edge of the sub-trigger. It adds to the move that places the
   * content at the end of the sub-trigger.
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

/** The events of the MenuSubContent. */
export interface MenuSubContentEmits {
  /**
   * Emits before Escape closes the submenu, with the keydown event. Call `preventDefault()` to keep it open.
   *
   * @example
   * <MenuSubContent @escape-key-down="(event) => saving && event.preventDefault()">...</MenuSubContent>
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  escapeKeyDown: [event: KeyboardEvent];
  /**
   * Emits before a press outside closes the submenu. The `detail.originalEvent` of the event is the press. Call
   * `preventDefault()` to keep it open.
   *
   * @example
   * <MenuSubContent @pointer-down-outside="(event) => event.preventDefault()">...</MenuSubContent>
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  pointerDownOutside: [event: PointerDownOutsideEvent];
  /**
   * Emits after `pointerDownOutside`, with the same event, before the submenu closes. Call `preventDefault()` to keep
   * it open.
   *
   * @example
   * <MenuSubContent @interact-outside="(event) => dirty && event.preventDefault()">...</MenuSubContent>
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  interactOutside: [event: PointerDownOutsideEvent | FocusOutsideEvent];
}
