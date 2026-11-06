import type { Component } from 'vue';
import type { AsTag, Direction, FocusOutsideEvent, PointerDownOutsideEvent } from '@cocokits/vue-core';
import type { OverlayAlign, OverlaySide, OverlayVirtualAnchor } from '@cocokits/cdk/positioning';
import type { OverlayArrowProps, OverlayPositioningProps } from '../internal/overlay-positioning.types';
import type { PopoverChangeReason } from '@cocokits/machines/popover';

export type { PopoverChangeReason };

/**
 * Groups a trigger, its content and a Close, and holds the open state. It renders no element: it provides the
 * state to its parts, so write the parts directly inside it. Bind the state with `v-model:open`.
 *
 * @example
 * <PopoverRoot v-model:open="open">
 *   <PopoverTrigger>Share</PopoverTrigger>
 *   <PopoverContent aria-label="Share">Link copied <PopoverClose>Close</PopoverClose></PopoverContent>
 * </PopoverRoot>
 *
 * @cckPart root
 */
export interface PopoverRootProps {
  /**
   * Whether the popover is open, bound with `v-model:open`. Bound with a listener it is controlled: a parent that
   * does not accept a change keeps the old value. Unbound, the popover keeps its own value. A popover that is open
   * on the server renders its content after hydration.
   *
   * @cckSemantic popover.open
   * @cckParity Bound with `v-model:open`.
   * @defaultValue false
   */
  readonly open?: boolean | undefined;
  /**
   * The modifiers written on `v-model:open`; the component only declares them so they do not reach the DOM.
   *
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly openModifiers?: Record<string, true> | undefined;
  /**
   * The initial open state of a popover that is not bound, read once when it is created. Binding `open` ignores it.
   * The content mounts after hydration, so a popover that is open by default renders closed on the server.
   *
   * @cckSemantic none
   * @cckParity The value the component starts with.
   * @defaultValue false
   */
  readonly defaultOpen?: boolean | undefined;
  /**
   * Whether the popover is modal. A modal popover makes everything outside its content inert (no pointer, focus or
   * assistive-technology access), locks the page scroll, keeps Tab and Shift+Tab inside the content, and closes on a
   * press outside without that press reaching what lies under it. The content gets `aria-modal="true"`. A change
   * while the popover is open takes effect at the next open.
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
   * Emits with the new open state for `v-model:open`, after every change the popover accepts.
   *
   * @cckSemantic popover.openChange
   * @remarks Carries no reason. A parent that bound `v-model:open` keeps its own value to refuse a change.
   * @cckParity The `update:open` event is the only change event; it carries no reason. A parent that bound `v-model:open` keeps its own value to refuse a change.
   */
  'update:open': [open: boolean];
}

/**
 * The `button` that toggles the popover. It gets `aria-expanded`, `aria-haspopup="dialog"` and, while the content
 * is mounted, `aria-controls`. Native button attributes and listeners fall through to it; a listener that calls
 * `preventDefault()` does not stop it from toggling the popover.
 *
 * @example
 * <PopoverTrigger>Share</PopoverTrigger>
 *
 * @cckPart trigger
 */
export interface PopoverTriggerProps {
  /**
   * The tag or component to render, in place of the `button`. The part keeps its role, state, ids and handlers.
   * A tag or component other than `button` gets `role="button"`, `tabindex="0"` and no `type`; Enter activates it on
   * keydown and Space on keyup, and a key listener that calls `preventDefault()` keeps it as it is. Ignored with
   * `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'button'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the trigger merges onto its first element or component child (a `Button`) instead of rendering a
   * `button`. The child must render a `button`; its own props win except the ARIA and `data-state` markers.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The non-modal `dialog` next to the trigger. It renders in the overlay container, not next to the trigger, only
 * while the popover is open (and while its exit animation runs). Focus moves into it on open and back to the
 * trigger when it closes. Name it with a `PopoverTitle`, or with `aria-label` or `aria-labelledby`; a development
 * warning reminds you. With a `PopoverAnchor` it is placed against the anchor instead of the trigger. The theme
 * sets the gap with `--side-offset`; `sideOffset` replaces it.
 *
 * @example
 * <PopoverContent aria-label="Share">Link copied</PopoverContent>
 *
 * @cckPart content
 */
export interface PopoverContentProps extends OverlayPositioningProps, OverlayArrowProps {
  /**
   * The side of the trigger the content opens on. `start` and `end` follow the direction. The content flips to
   * the opposite side when there is no room; `data-side` reports the side it ended on.
   *
   * @defaultValue 'bottom'
   */
  readonly side?: OverlaySide | undefined;
  /**
   * How the content lines up along the trigger's edge. It shifts to stay in view; `data-align` reports the result.
   *
   * @defaultValue 'center'
   */
  readonly align?: OverlayAlign | undefined;
  /**
   * An element or virtual element to place the content against, in place of the `PopoverAnchor` and the trigger.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly reference?: Element | OverlayVirtualAnchor | undefined;
  /**
   * Whether the content stays in the document while the popover is closed, so its state and children are kept. It
   * is `hidden` while closed, and has no dismissal, positioning or focus handling then. It renders after hydration:
   * the server renders no content.
   *
   * @cckSemantic popover.content.forceMount
   * @cckParity Not available in every framework.
   * @defaultValue false
   */
  readonly forceMount?: boolean | undefined;
  /**
   * The tag or component to render, in place of the `div`. The part keeps its role, state, ids and handlers. Ignored
   * with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * The text direction of the popover content: the `start` and `end` placement, the overlay container and nested
   * components follow it. Without it the nearest `provideDirection` applies, else `'ltr'`.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly dir?: Direction | undefined;
  /**
   * Whether the content merges onto its first element or component child instead of rendering a `div`. The
   * child keeps `role="dialog"`, the ids and the state markers of the content.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The events of the PopoverContent. The first four are cancelable: a listener that calls `preventDefault()` on its
 * event (or is written with `.prevent`) refuses the dismissal and the popover stays open. Refusing Escape weakens
 * the dialog pattern, because users expect it to close the popover; keep the refusal short-lived. A refused
 * focus-out moves nothing: the user can still Tab out of a non-modal popover.
 *
 * @example
 * <PopoverContent aria-label="Share" @focus-outside.prevent>…</PopoverContent>
 */
export interface PopoverContentEmits {
  /**
   * Emits before Escape closes the popover, with the keydown. Call `preventDefault()` to keep it open.
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  escapeKeyDown: [event: KeyboardEvent];
  /**
   * Emits before a press outside closes the popover, with a cancelable event whose `detail.originalEvent` is the
   * press. Call `preventDefault()` to keep it open.
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  pointerDownOutside: [event: PointerDownOutsideEvent];
  /**
   * Emits before focus moving outside closes the popover, with a cancelable event whose `detail.originalEvent` is
   * the focus event. Call `preventDefault()` to keep it open.
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  focusOutside: [event: FocusOutsideEvent];
  /**
   * Emits after `pointerDownOutside` or `focusOutside`, with the same event, before the popover closes. Call
   * `preventDefault()` to keep it open.
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  interactOutside: [event: PointerDownOutsideEvent | FocusOutsideEvent];
  /**
   * Emits before focus moves into the popover on open. Call `preventDefault()` to keep focus where it is, or
   * to move it yourself.
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  openAutoFocus: [event: Event];
  /**
   * Emits before focus returns to the trigger on close. Call `preventDefault()` to skip the return and move focus
   * yourself.
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  closeAutoFocus: [event: Event];
}

/**
 * An optional element the content is placed against instead of the trigger. It has no role and changes nothing but the position: `aria-expanded` and the focus return stay with the trigger. With several anchors the last one mounted counts.
 *
 * @example
 * <PopoverAnchor>Draft saved</PopoverAnchor>
 *
 * @cckPart anchor
 */
export interface PopoverAnchorProps {
  /**
   * An element or virtual element to place the content against, in place of the anchor's own element.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly reference?: Element | OverlayVirtualAnchor | undefined;
  /**
   * The tag or component to render, in place of the `div`. Ignored with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first element or component child instead of rendering a `div`.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The heading that names the popover; the content refers to it with `aria-labelledby` while it is mounted. It renders an `h2`; use `asChild` with another heading level.
 *
 * @example
 * <PopoverTitle>Share</PopoverTitle>
 *
 * @cckPart title
 */
export interface PopoverTitleProps {
  /**
   * The tag or component to render, in place of the `h2`. Ignored with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'h2'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first element or component child instead of rendering a `h2`.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The text that describes the popover; the content refers to it with `aria-describedby` while it is mounted.
 *
 * @example
 * <PopoverDescription>Anyone with the link can view.</PopoverDescription>
 *
 * @cckPart description
 */
export interface PopoverDescriptionProps {
  /**
   * The tag or component to render, in place of the `p`. Ignored with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'p'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first element or component child instead of rendering a `p`.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * A `button` that closes the popover. Native button attributes and listeners fall through to it; a listener that
 * calls `preventDefault()` does not stop it from closing the popover.
 *
 * @example
 * <PopoverClose>Close</PopoverClose>
 *
 * @cckPart close
 */
export interface PopoverCloseProps {
  /**
   * The tag or component to render, in place of the `button`. The part keeps its role, state, ids and handlers.
   * A tag or component other than `button` gets `role="button"`, `tabindex="0"` and no `type`; Enter activates it on
   * keydown and Space on keyup, and a key listener that calls `preventDefault()` keeps it as it is. Ignored with
   * `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'button'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the Close merges onto its first element or component child (a `Button`) instead of rendering a
   * `button`. The child must render a `button`.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * A pointer from the content to the anchor, a child of `PopoverContent`. It renders a `span` that holds a triangle
 * `svg`, is hidden from assistive technology, and is placed by the positioning on the edge that faces the anchor.
 * While it cannot point at the anchor's centre it is hidden with the native `hidden` attribute (see
 * `hideShiftedArrow`). Children replace the triangle: they render inside its `svg`. The gap between the anchor and the
 * content grows by the height of the arrow, so the theme's gap is between the arrow tip and the anchor.
 *
 * @example
 * <PopoverContent aria-label="Share">Link copied <PopoverArrow /></PopoverContent>
 *
 * @cckPart arrow
 */
export interface PopoverArrowProps {
  /**
   * The tag or component to render, in place of the `span`. Render an HTML element: an SVG element is not hidden
   * by the `hidden` attribute without a theme rule. Ignored with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'span'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first element or component child instead of rendering a `span` with the
   * triangle. The child is the whole arrow.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
