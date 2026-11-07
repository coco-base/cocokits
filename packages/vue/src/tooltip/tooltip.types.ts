import type { Component } from 'vue';
import type { AsTag, PointerDownOutsideEvent } from '@cocokits/vue-core';
import type { OverlayAlign, OverlaySide, OverlayVirtualAnchor } from '@cocokits/cdk/positioning';
import type { TooltipChangeReason } from '@cocokits/machines/tooltip';
import type { OverlayArrowProps, OverlayPositioningProps } from '../internal/overlay-positioning.types';

export type { TooltipChangeReason };

/**
 * Groups a trigger and its content, and holds the open state and the timers. It renders no element, so write the
 * parts directly inside it. Bind the state with `v-model:open`.
 *
 * The tooltip opens after `delayDuration` on a mouse or pen hover, and at once on keyboard focus. Touch never opens
 * it.
 *
 * It closes shortly after the pointer leaves the trigger and the content, or at once with `disableHoverableContent`.
 * It also closes on blur, on Escape, on a press outside and when an ancestor of the trigger scrolls. A press on the
 * trigger closes it too, unless `disableClosingTrigger` is set.
 *
 * `delayDuration`, `disableHoverableContent`, `disableClosingTrigger` and `disabled` take their defaults from the
 * `TooltipProvider` around the tooltip. The `ariaLabel` of the content, or its text, describes the trigger while the
 * tooltip is closed.
 *
 * @example
 * <TooltipProvider>
 *   <TooltipRoot>
 *     <TooltipTrigger aria-label="Copy link"><CopyIcon aria-hidden="true" /></TooltipTrigger>
 *     <TooltipContent>
 *       Copy link
 *       <TooltipArrow />
 *     </TooltipContent>
 *   </TooltipRoot>
 * </TooltipProvider>
 *
 * @cckPart root
 */
export interface TooltipRootProps {
  /**
   * Whether the tooltip is shown, bound with `v-model:open`. When not set, the tooltip keeps its own state, which
   * starts as `defaultOpen`.
   *
   * If you listen for changes and do not accept one, the old value stays. A tooltip that is open on the server
   * renders its content after hydration.
   *
   * @cckSemantic tooltip.open
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
   * The start open state of a tooltip whose `open` is not bound. It is read once, when the tooltip is created. A
   * bound `open` ignores it.
   *
   * The content mounts after hydration, so a tooltip that starts open renders closed on the server.
   *
   * @cckSemantic none
   * @cckParity The value the component starts with.
   * @defaultValue false
   */
  readonly defaultOpen?: boolean | undefined;
  /**
   * The milliseconds between a mouse or pen hover and the tooltip showing. Keyboard focus shows it at once.
   *
   * Inside a `TooltipProvider`, a hover opens it at once while another tooltip of the group is open. The same is true
   * for `skipDelayDuration` after that tooltip closed.
   *
   * @cckSemantic tooltip.delay
   * @cckDefaultDiffers The delay belongs to the Provider.
   * @defaultValue 700, from the Provider
   */
  readonly delayDuration?: number | undefined;
  /**
   * Whether the pointer leaving the trigger hides the tooltip at once. The pointer on the content then does not keep
   * it open.
   *
   * Leave it off unless the content is only visual. Content the pointer can rest on lets users read it with a
   * magnifier (WCAG 1.4.13).
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue false, from the Provider
   */
  readonly disableHoverableContent?: boolean | undefined;
  /**
   * Whether a press on the trigger leaves the tooltip shown instead of closing it.
   *
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   * @defaultValue false, from the Provider
   */
  readonly disableClosingTrigger?: boolean | undefined;
  /**
   * Whether the tooltip never opens. A disabled tooltip is closed, and its content is not rendered. It also removes
   * the description of the trigger.
   *
   * Turning it on while the tooltip is open closes it without an `update:open`. A tooltip whose `open` is not bound
   * stays closed when it turns off again.
   *
   * @cckSemantic tooltip.disabled
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
}

/**
 * Holds the delay group and the defaults of the tooltips inside it. It renders no element.
 *
 * After a tooltip of the group opens, the next hover in the group opens without delay. That stays so for
 * `skipDelayDuration` after the last one closed.
 *
 * Wrap the page, or a toolbar, once. The provider is optional: a tooltip outside any provider has the built-in
 * defaults and no group. A nested provider forms its own group.
 *
 * @example
 * <TooltipProvider :delay-duration="400">
 *   <TooltipRoot>...</TooltipRoot>
 * </TooltipProvider>
 *
 * @cckPart provider
 * @cckSemantic none
 * @cckParity Not available in every framework.
 */
export interface TooltipProviderProps {
  /**
   * The milliseconds between a mouse or pen hover and a tooltip showing, for the tooltips inside that set no
   * `delayDuration`.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue 700
   */
  readonly delayDuration?: number | undefined;
  /**
   * The milliseconds after a tooltip of the group closed, during which a hover on another trigger opens at once.
   * With `0` or less, there is no skip.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue 300
   */
  readonly skipDelayDuration?: number | undefined;
  /**
   * The default of `disableHoverableContent` for the tooltips inside.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   * @defaultValue false
   */
  readonly disableHoverableContent?: boolean | undefined;
  /**
   * The default of `disableClosingTrigger` for the tooltips inside.
   *
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   * @defaultValue false
   */
  readonly disableClosingTrigger?: boolean | undefined;
  /**
   * The default of `disabled` for the tooltips inside.
   *
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
}

/** The events of the TooltipRoot. */
export interface TooltipRootEmits {
  /**
   * Emits the new open state for `v-model:open` after every change the tooltip accepts. It carries no reason.
   *
   * To refuse a change, a parent that bound `v-model:open` keeps its own value.
   *
   * @cckSemantic tooltip.openChange
   * @cckParity The `update:open` event is the only change event; it carries no reason. A parent that bound `v-model:open` keeps its own value to refuse a change.
   */
  'update:open': [open: boolean];
}

/**
 * The element the tooltip describes. It renders a `<button>`, unless `asChild` merges it onto your own focusable
 * element. Native attributes and listeners fall through to it.
 *
 * While the content is mounted, it gets `aria-describedby`, added to any description you wrote. A disabled button
 * cannot take the focus, so it never shows the tooltip. Its accessible name must not depend on the tooltip, so an
 * icon-only trigger needs `aria-label`.
 *
 * With `as`, a tag or component other than `button` gets `tabindex="0"` and no `type`. With `asChild`, the child
 * must take the focus. Its own props win, except `aria-describedby`, `id` and `data-state`.
 *
 * @example
 * <TooltipTrigger aria-label="Copy link"><CopyIcon aria-hidden="true" /></TooltipTrigger>
 *
 * @cckPart trigger
 */
export interface TooltipTriggerProps {
  /**
   * An element or virtual element to place the content against, in place of the trigger. The events and the
   * description stay on the trigger. When not set, the content is placed against the trigger.
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

/** The events of the TooltipContent. */
export interface TooltipContentEmits {
  /**
   * Emits before Escape closes the tooltip, with the keydown event. Call `preventDefault()` to keep the tooltip
   * shown.
   *
   * @example
   * <TooltipContent @escape-key-down.prevent>Copy link</TooltipContent>
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  escapeKeyDown: [event: KeyboardEvent];
  /**
   * Emits before a press outside closes the tooltip. The `detail.originalEvent` of the event is the press. Call
   * `preventDefault()` to keep the tooltip shown.
   *
   * @example
   * <TooltipContent @pointer-down-outside.prevent>Copy link</TooltipContent>
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  pointerDownOutside: [event: PointerDownOutsideEvent];
}

/**
 * The bubble of the tooltip, with `role="tooltip"`, placed next to the trigger. It renders in the overlay container,
 * not next to the trigger. It renders only while the tooltip is shown and while its exit animation runs.
 *
 * It never takes the focus, and it stays open while the pointer is over it, unless `disableHoverableContent` is set.
 * So keep it free of interactive content. The theme sets the gap from the trigger with `--side-offset`, and
 * `sideOffset` replaces it.
 *
 * Call `preventDefault()` in a listener of `escapeKeyDown` or `pointerDownOutside` to keep the tooltip shown, or
 * write the listener with `.prevent`. Content that appears on hover or focus must stay easy to close (WCAG 1.4.13).
 * So refuse only when your page gives another way to close it. The pointer leaving and the blur still close it.
 *
 * With `asChild`, the child keeps `role="tooltip"`, the id and the state markers of the content.
 *
 * @example
 * <TooltipContent side="bottom">Copy link</TooltipContent>
 *
 * @cckPart content
 */
export interface TooltipContentProps extends OverlayPositioningProps, OverlayArrowProps {
  /**
   * The text that describes the trigger, while the tooltip is closed and while it is open. When not set, a default
   * slot that is text only is the description.
   *
   * A hidden description of the trigger carries the text. The visible content is hidden from assistive technology,
   * so the text is read once. It adds nothing when it equals the `aria-label` of the trigger. It is not set on the
   * visible content.
   *
   * @cckSemantic tooltip.content.aria-label
   * @cckParity The text of the hidden description of the trigger.
   */
  readonly ariaLabel?: string | undefined;
  /**
   * The side of the trigger the content opens on. `start` and `end` follow the direction. The content moves to the
   * opposite side when there is no room, and `data-side` gives the side it ended on.
   *
   * @defaultValue 'top'
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
   * Whether the content stays in the document while the tooltip is closed, so its children are kept. While closed,
   * it is `hidden` and has no dismissal or placement.
   *
   * It renders after hydration, so the server renders no content.
   *
   * @cckSemantic tooltip.content.forceMount
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
 * A pointer from the content to the anchor, written inside `TooltipContent`. It renders a `<span>` that holds a
 * triangle `<svg>`. Assistive technology does not see it.
 *
 * It sits on the edge that faces the anchor. While it cannot point at the centre of the anchor, it is hidden with
 * the native `hidden` attribute (see `hideShiftedArrow`). Children replace the triangle: they render inside its
 * `<svg>`. The gap between the trigger and the content grows by the height of the arrow.
 *
 * With `as`, render an HTML element: the `hidden` attribute does not hide an SVG element without a theme rule. With
 * `asChild`, the child is the whole arrow, without the triangle.
 *
 * @example
 * <TooltipContent>Copy link <TooltipArrow /></TooltipContent>
 *
 * @cckPart arrow
 */
export interface TooltipArrowProps {
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
