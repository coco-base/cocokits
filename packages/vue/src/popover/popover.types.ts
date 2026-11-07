import type { Component } from 'vue';
import type { AsTag, Direction, FocusOutsideEvent, PointerDownOutsideEvent } from '@cocokits/vue-core';
import type { OverlayAlign, OverlaySide, OverlayVirtualAnchor } from '@cocokits/cdk/positioning';
import type { OverlayArrowProps, OverlayPositioningProps } from '../internal/overlay-positioning.types';
import type { PopoverChangeReason } from '@cocokits/machines/popover';

export type { PopoverChangeReason };

/**
 * Groups a trigger, its content and a Close, and holds the open state. It renders no element, so write the parts
 * directly inside it. Bind the state with `v-model:open`.
 *
 * @example
 * <PopoverRoot v-model:open="open">
 *   <PopoverAnchor>
 *     <PopoverTrigger>Share</PopoverTrigger>
 *   </PopoverAnchor>
 *   <PopoverContent>
 *     <PopoverTitle>Share</PopoverTitle>
 *     <PopoverDescription>Anyone with the link can view.</PopoverDescription>
 *     <PopoverClose>Close</PopoverClose>
 *     <PopoverArrow />
 *   </PopoverContent>
 * </PopoverRoot>
 *
 * @cckPart root
 */
export interface PopoverRootProps {
  /**
   * Whether the popover is open, bound with `v-model:open`. When not set, the popover keeps its own state, which
   * starts as `defaultOpen`.
   *
   * If you listen for changes and do not accept one, the old value stays. A popover that is open on the server
   * renders its content after hydration.
   *
   * @cckSemantic popover.open
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
   * The start open state of a popover whose `open` is not bound. It is read once, when the popover is created. A
   * bound `open` ignores it.
   *
   * The content mounts after hydration, so a popover that starts open renders closed on the server.
   *
   * @cckSemantic none
   * @cckParity The value the component starts with.
   * @defaultValue false
   */
  readonly defaultOpen?: boolean | undefined;
  /**
   * Whether the popover is modal. The content of a modal popover gets `aria-modal="true"`. A change while the popover
   * is open takes effect at the next open.
   *
   * A modal popover makes everything outside its content inert: no pointer, focus or assistive technology reaches
   * it. It locks the page scroll and keeps Tab and Shift+Tab inside the content. It closes on a press outside, and
   * that press does not reach what lies under it.
   *
   * @cckSemantic popover.modal
   * @cckParity Not available in every framework.
   * @defaultValue false
   */
  readonly modal?: boolean | undefined;
}

/** The events of the PopoverRoot. */
export interface PopoverRootEmits {
  /**
   * Emits the new open state for `v-model:open` after every change the popover accepts. It carries no reason.
   *
   * To refuse a change, a parent that bound `v-model:open` keeps its own value.
   *
   * @cckSemantic popover.openChange
   * @cckParity The `update:open` event is the only change event; it carries no reason. A parent that bound `v-model:open` keeps its own value to refuse a change.
   */
  'update:open': [open: boolean];
}

/**
 * The `<button>` that opens and closes the popover. It gets `aria-expanded` and `aria-haspopup="dialog"`, and
 * `aria-controls` while the content is mounted.
 *
 * Native button attributes and listeners fall through to it. A listener that calls `preventDefault()` does not stop
 * it from toggling the popover.
 *
 * With `as`, a tag or component other than `button` gets `role="button"`, `tabindex="0"` and no `type`. Enter
 * activates it on keydown and Space on keyup. A key listener that calls `preventDefault()` stops that. With
 * `asChild`, the child must render a `<button>`. Its own props win, except the ARIA and `data-state` markers.
 *
 * @example
 * <PopoverTrigger>Share</PopoverTrigger>
 *
 * @cckPart trigger
 */
export interface PopoverTriggerProps {
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
 * The `dialog` of the popover, placed next to the trigger. It renders in the overlay container, not next to the
 * trigger. It renders only while the popover is open and while its exit animation runs.
 *
 * The focus moves into it on open and back to the trigger when it closes. Name it with a `PopoverTitle`, or with
 * `aria-label` or `aria-labelledby`; a development warning reminds you.
 *
 * With a `PopoverAnchor`, it is placed against the anchor instead of the trigger. The theme sets the gap with
 * `--side-offset`, and `sideOffset` replaces it. With `asChild`, the child keeps `role="dialog"`, the ids and the
 * state markers of the content.
 *
 * Call `preventDefault()` in a listener of `escapeKeyDown`, `pointerDownOutside`, `focusOutside` or
 * `interactOutside` to keep the popover open, or write the listener with `.prevent`. Users expect Escape to close
 * the popover, so refuse only for a short time. A refused focus-out moves nothing: the user can still Tab out of a
 * popover that is not modal.
 *
 * @example
 * <PopoverContent aria-label="Share">Link copied</PopoverContent>
 *
 * @cckPart content
 */
export interface PopoverContentProps extends OverlayPositioningProps, OverlayArrowProps {
  /**
   * The side of the trigger the content opens on. `start` and `end` follow the direction. The content moves to the
   * opposite side when there is no room, and `data-side` gives the side it ended on.
   *
   * @defaultValue 'bottom'
   */
  readonly side?: OverlaySide | undefined;
  /**
   * How the content lines up along the edge of the trigger. It moves to stay in view, and `data-align` gives the
   * result.
   *
   * @defaultValue 'center'
   */
  readonly align?: OverlayAlign | undefined;
  /**
   * An element or virtual element to place the content against, in place of the `PopoverAnchor` and the trigger.
   * When not set, the content is placed against the `PopoverAnchor`, or else the trigger.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly reference?: Element | OverlayVirtualAnchor | undefined;
  /**
   * Whether the content stays in the document while the popover is closed, so its children keep their state. While
   * closed, it is `hidden` and has no dismissal, placement or focus handling.
   *
   * It renders after hydration, so the server renders no content.
   *
   * @cckSemantic popover.content.forceMount
   * @cckParity Not available in every framework.
   * @defaultValue false
   */
  readonly forceMount?: boolean | undefined;
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
   * The text direction of the content. The `start` and `end` sides, the overlay container and the nested components
   * follow it. When not set, the nearest direction provider applies, and then `'ltr'`.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly dir?: Direction | undefined;
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

/** The events of the PopoverContent. */
export interface PopoverContentEmits {
  /**
   * Emits before Escape closes the popover, with the keydown event. Call `preventDefault()` to keep the popover open.
   *
   * @example
   * <PopoverContent aria-label="Share" @escape-key-down="(event) => saving && event.preventDefault()">...</PopoverContent>
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  escapeKeyDown: [event: KeyboardEvent];
  /**
   * Emits before a press outside closes the popover. The `detail.originalEvent` of the event is the press. Call
   * `preventDefault()` to keep the popover open.
   *
   * @example
   * <PopoverContent aria-label="Share" @pointer-down-outside="(event) => event.preventDefault()">...</PopoverContent>
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  pointerDownOutside: [event: PointerDownOutsideEvent];
  /**
   * Emits before the focus moving outside closes the popover. The `detail.originalEvent` of the event is the focus
   * event. Call `preventDefault()` to keep the popover open.
   *
   * @example
   * <PopoverContent aria-label="Share" @focus-outside.prevent>...</PopoverContent>
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  focusOutside: [event: FocusOutsideEvent];
  /**
   * Emits after `pointerDownOutside` or `focusOutside`, with the same event, before the popover closes. Call
   * `preventDefault()` to keep the popover open.
   *
   * @example
   * <PopoverContent aria-label="Share" @interact-outside="(event) => dirty && event.preventDefault()">...</PopoverContent>
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  interactOutside: [event: PointerDownOutsideEvent | FocusOutsideEvent];
  /**
   * Emits before the focus moves into the popover on open. Call `preventDefault()` to keep the focus where it is,
   * or to move it yourself.
   *
   * @example
   * <PopoverContent aria-label="Share" @open-auto-focus="(event) => { event.preventDefault(); nameInput?.focus(); }">...</PopoverContent>
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  openAutoFocus: [event: Event];
  /**
   * Emits before the focus returns to the trigger on close. Call `preventDefault()` to skip the return and move the
   * focus yourself.
   *
   * @example
   * <PopoverContent aria-label="Share" @close-auto-focus="(event) => { event.preventDefault(); searchInput?.focus(); }">...</PopoverContent>
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  closeAutoFocus: [event: Event];
}

/**
 * An element the content is placed against instead of the trigger. It renders a `<div>` with no role. It changes
 * only the position: `aria-expanded` and the focus return stay with the trigger.
 *
 * With several anchors, the last one mounted counts.
 *
 * @example
 * <PopoverAnchor>Draft saved</PopoverAnchor>
 *
 * @cckPart anchor
 */
export interface PopoverAnchorProps {
  /**
   * An element or virtual element to place the content against, in place of the element of the anchor. When not
   * set, the content is placed against the element of the anchor.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly reference?: Element | OverlayVirtualAnchor | undefined;
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
 * The heading that names the popover. It renders an `<h2>`. Use `as` or `asChild` for another heading level.
 *
 * The content refers to it with `aria-labelledby` while it is mounted.
 *
 * @example
 * <PopoverTitle>Share</PopoverTitle>
 *
 * @cckPart title
 */
export interface PopoverTitleProps {
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
 * The text that describes the popover. It renders a `<p>`. The content refers to it with `aria-describedby` while
 * it is mounted.
 *
 * @example
 * <PopoverDescription>Anyone with the link can view.</PopoverDescription>
 *
 * @cckPart description
 */
export interface PopoverDescriptionProps {
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
 * A `<button>` that closes the popover. Native button attributes and listeners fall through to it. A listener that
 * calls `preventDefault()` does not stop it from closing the popover.
 *
 * With `as`, a tag or component other than `button` gets `role="button"`, `tabindex="0"` and no `type`. Enter
 * activates it on keydown and Space on keyup. A key listener that calls `preventDefault()` stops that. With
 * `asChild`, the child must render a `<button>`.
 *
 * @example
 * <PopoverClose>Close</PopoverClose>
 *
 * @cckPart close
 */
export interface PopoverCloseProps {
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
 * A pointer from the content to the anchor, written inside `PopoverContent`. It renders a `<span>` that holds a
 * triangle `<svg>`. Assistive technology does not see it.
 *
 * It sits on the edge that faces the anchor. While it cannot point at the centre of the anchor, it is hidden with
 * the native `hidden` attribute (see `hideShiftedArrow`). Children replace the triangle: they render inside its
 * `<svg>`.
 *
 * The gap between the anchor and the content grows by the height of the arrow. So the gap of the theme is between
 * the tip of the arrow and the anchor.
 *
 * With `as`, render an HTML element: the `hidden` attribute does not hide an SVG element without a theme rule. With
 * `asChild`, the child is the whole arrow, without the triangle.
 *
 * @example
 * <PopoverContent aria-label="Share">Link copied <PopoverArrow /></PopoverContent>
 *
 * @cckPart arrow
 */
export interface PopoverArrowProps {
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
