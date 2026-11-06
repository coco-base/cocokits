import type { Component } from 'vue';
import type { AsTag, PointerDownOutsideEvent } from '@cocokits/vue-core';
import type { OverlayAlign, OverlaySide, OverlayVirtualAnchor } from '@cocokits/cdk/positioning';
import type { TooltipChangeReason } from '@cocokits/machines/tooltip';
import type { OverlayArrowProps, OverlayPositioningProps } from '../internal/overlay-positioning.types';

export type { TooltipChangeReason };

/**
 * Groups a trigger and its content, and holds the open state and the timers. It renders no element: it provides
 * the state to its parts, so write the parts directly inside it. Bind the state with `v-model:open`. The tooltip
 * opens after `delayDuration` on a mouse or pen hover and at once on keyboard focus; touch never opens it. It closes
 * shortly after the pointer leaves the trigger and the content (at once with `disableHoverableContent`), on blur,
 * on Escape, on a press outside, on a press on the trigger (unless `disableClosingTrigger`) and when an ancestor of
 * the trigger scrolls. `delayDuration`, `disableHoverableContent`, `disableClosingTrigger` and `disabled` default to
 * the values of the `TooltipProvider` around it. The `ariaLabel` of the content, or its text, describes the trigger
 * while the tooltip is closed.
 *
 * @example
 * <TooltipRoot>
 *   <TooltipTrigger aria-label="Copy link">...</TooltipTrigger>
 *   <TooltipContent>Copy link</TooltipContent>
 * </TooltipRoot>
 *
 * @cckPart root
 */
export interface TooltipRootProps {
  /**
   * Whether the tooltip is shown, bound with `v-model:open`. Bound with a listener it is controlled: a parent that
   * does not accept a change keeps the old value. Unbound, the tooltip keeps its own value. A tooltip that is open
   * on the server renders its content after hydration.
   *
   * @cckSemantic tooltip.open
   * @cckParity Vue's `v-model:open`.
   * @defaultValue false
   */
  readonly open?: boolean | undefined;
  /**
   * The modifiers written on `v-model:open`; the component only declares them so they do not reach the DOM.
   *
   * @cckSemantic none
   * @cckParity Vue-only: Vue fills it from the modifiers written on `v-model:open`.
   */
  readonly openModifiers?: Record<string, true> | undefined;
  /**
   * The initial open state of a tooltip that is not bound, read once when it is created. Binding `open` ignores it.
   * The content mounts after hydration, so a tooltip that is open by default renders closed on the server.
   *
   * @cckSemantic none
   * @cckParity Vue's uncontrolled start value, as React's `defaultOpen`; Angular has no open state to bind and opens with `show()`, `hide()` and `toggle()`.
   * @defaultValue false
   */
  readonly defaultOpen?: boolean | undefined;
  /**
   * Milliseconds between a mouse or pen hover and the tooltip showing. Keyboard focus shows it at once. Inside a
   * `TooltipProvider`, a hover opens at once while another tooltip of the group is open and for `skipDelayDuration`
   * after it closed.
   *
   * @cckSemantic tooltip.delay
   * @cckDefaultDiffers Angular reads its delay from CCK_TOOLTIP_DEFAULT_OPTIONS (0), React and Vue from the Provider (700), as Material, Radix and Reka do.
   * @defaultValue 700, from the Provider
   */
  readonly delayDuration?: number | undefined;
  /**
   * Whether the pointer leaving the trigger hides the tooltip at once, and the pointer on the content does not
   * keep it open. Leave it off unless the content is purely visual: a hoverable content lets users read it with a
   * magnifier (WCAG 1.4.13).
   *
   * @cckSemantic none
   * @cckParity Vue and React (Radix and Reka); Angular has the `disableTooltipInteractivity` token option.
   * @defaultValue false, from the Provider
   */
  readonly disableHoverableContent?: boolean | undefined;
  /**
   * Whether a press on the trigger leaves the tooltip shown instead of closing it.
   *
   * @cckSemantic none
   * @cckParity Vue only (Reka UI).
   * @defaultValue false, from the Provider
   */
  readonly disableClosingTrigger?: boolean | undefined;
  /**
   * Whether the tooltip never opens. A disabled tooltip is closed and its content is not rendered. Turning it on
   * while the tooltip is open closes it without an `update:open`, and an unbound tooltip stays closed when it turns
   * off again. It also removes the description of the trigger.
   *
   * @cckSemantic tooltip.disabled
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
}

/**
 * Holds the delay group and the defaults of the tooltips inside it. It renders no element. After a tooltip of the
 * group opens, the next hover in the group opens without delay, and keeps doing so for `skipDelayDuration` after
 * the last one closed. Wrap the page, or a toolbar, once; it is optional, and a tooltip outside any provider has
 * the built-in defaults and no group. A nested provider forms its own group.
 *
 * @example
 * <TooltipProvider :delay-duration="400">
 *   <TooltipRoot>...</TooltipRoot>
 * </TooltipProvider>
 *
 * @cckPart provider
 * @cckSemantic none
 * @cckParity Vue and React only (Reka UI and Radix); Angular sets the defaults with CCK_TOOLTIP_DEFAULT_OPTIONS and has no group.
 */
export interface TooltipProviderProps {
  /**
   * Milliseconds between a mouse or pen hover and a tooltip showing, for the tooltips inside that set no
   * `delayDuration`.
   *
   * @cckSemantic none
   * @cckParity Vue and React only (Reka UI and Radix); Angular sets the defaults with CCK_TOOLTIP_DEFAULT_OPTIONS.
   * @defaultValue 700
   */
  readonly delayDuration?: number | undefined;
  /**
   * Milliseconds after a tooltip of the group closed during which a hover on another trigger opens at once. With
   * `0` or less nothing is skipped.
   *
   * @cckSemantic none
   * @cckParity Vue and React only (Reka UI and Radix).
   * @defaultValue 300
   */
  readonly skipDelayDuration?: number | undefined;
  /**
   * The default of `disableHoverableContent` for the tooltips inside.
   *
   * @cckSemantic none
   * @cckParity Vue and React only (Reka UI and Radix).
   * @defaultValue false
   */
  readonly disableHoverableContent?: boolean | undefined;
  /**
   * The default of `disableClosingTrigger` for the tooltips inside.
   *
   * @cckSemantic none
   * @cckParity Vue only (Reka UI).
   * @defaultValue false
   */
  readonly disableClosingTrigger?: boolean | undefined;
  /**
   * The default of `disabled` for the tooltips inside.
   *
   * @cckSemantic none
   * @cckParity Vue only (Reka UI).
   * @defaultValue false
   */
  readonly disabled?: boolean | undefined;
}

/** The events of the TooltipRoot. */
export interface TooltipRootEmits {
  /**
   * Emits with the new open state for `v-model:open`, after every change the tooltip accepts.
   *
   * @cckSemantic tooltip.openChange
   * @remarks Carries no reason. A parent that bound `v-model:open` keeps its own value to refuse a change.
   * @cckParity Vue's change event is the `v-model:open` update event, as in Reka UI; it carries no reason. A parent that bound `v-model:open` keeps its own value to refuse a change. React calls `onOpenChange`; Angular has no open-state event and opens with `show()`, `hide()` and `toggle()`.
   */
  'update:open': [open: boolean];
}

/**
 * The element the tooltip describes: a `button` unless `asChild` merges it onto your own focusable element. While
 * the content is mounted it gets `aria-describedby`, added to any description you wrote. Native attributes and
 * listeners fall through to it. A disabled button cannot be focused, so it never shows the tooltip. Its accessible
 * name must not depend on the tooltip: an icon-only trigger needs `aria-label`.
 *
 * @example
 * <TooltipTrigger aria-label="Copy link">...</TooltipTrigger>
 *
 * @cckPart trigger
 */
export interface TooltipTriggerProps {
  /**
   * An element or virtual element to place the content against, in place of the trigger. The events and the
   * description stay on the trigger.
   *
   * @cckSemantic none
   * @cckParity Vue only (Reka UI's `reference`).
   */
  readonly reference?: Element | OverlayVirtualAnchor | undefined;
  /**
   * The tag or component to render, in place of the `button`. The part keeps its role, state, ids and handlers.
   * A tag or component other than `button` gets `tabindex="0"` and no `type`. Ignored with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Vue's element override (Reka).
   * @defaultValue 'button'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the trigger merges onto its first element or component child (a `Button`, a link) instead of
   * rendering a `button`. The child must be focusable; its own props win except `aria-describedby`, `id` and
   * `data-state`.
   *
   * @cckSemantic none
   * @cckParity Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The events of the TooltipContent. Both are cancelable: a listener that calls `preventDefault()` on its event (or
 * is written with `.prevent`) keeps the tooltip shown. Content that appears on hover or focus must stay
 * dismissible (WCAG 1.4.13), so refuse only when your page offers another way to dismiss it. The pointer leaving
 * and the blur still close it.
 *
 * @example
 * <TooltipContent @escape-key-down.prevent>Copy link</TooltipContent>
 */
export interface TooltipContentEmits {
  /**
   * Emits before Escape closes the tooltip, with the keydown. Call `preventDefault()` to keep it shown.
   *
   * @cckSemantic none
   * @cckParity Vue's Content emit (Reka UI); React has the `onEscapeKeyDown` handler and Angular `disableClose`.
   */
  escapeKeyDown: [event: KeyboardEvent];
  /**
   * Emits before a press outside closes the tooltip, with a cancelable event whose `detail.originalEvent` is the
   * press. Call `preventDefault()` to keep it shown.
   *
   * @cckSemantic none
   * @cckParity Vue's Content emit (Reka UI); React has the `onPointerDownOutside` handler and Angular `disableClose`.
   */
  pointerDownOutside: [event: PointerDownOutsideEvent];
}

/**
 * The `tooltip` bubble next to the trigger. It renders in the overlay container, not next to the trigger, only
 * while the tooltip is shown (and while its exit animation runs). It never takes focus and stays open while the
 * pointer is over it (unless `disableHoverableContent`), so keep it free of interactive content. The theme sets the
 * gap from the trigger with `--side-offset`; `sideOffset` replaces it.
 *
 * @example
 * <TooltipContent side="bottom">Copy link</TooltipContent>
 *
 * @cckPart content
 */
export interface TooltipContentProps extends OverlayPositioningProps, OverlayArrowProps {
  /**
   * The text that describes the trigger while the tooltip is closed and open: a hidden description of the trigger
   * carries it, and the visible content is hidden from assistive technology so the text is read once. Without it,
   * a default slot that is text only is the description. It adds nothing when it equals the trigger's `aria-label`.
   * It is not set on the visible content.
   *
   * @cckSemantic tooltip.content.aria-label
   * @cckParity Vue's `ariaLabel` prop; React has the `aria-label` attribute and Angular the `cckTooltip` message.
   */
  readonly ariaLabel?: string | undefined;
  /**
   * The side of the trigger the content opens on. `start` and `end` follow the direction. The content flips to
   * the opposite side when there is no room; `data-side` reports the side it ended on.
   *
   * @defaultValue 'top'
   */
  readonly side?: OverlaySide | undefined;
  /**
   * How the content lines up along the trigger's edge. It shifts to stay in view; `data-align` reports the result.
   *
   * @defaultValue 'center'
   */
  readonly align?: OverlayAlign | undefined;
  /**
   * Whether the content stays in the document while the tooltip is closed, so its children are kept. It is
   * `hidden` while closed, and has no dismissal or positioning then. It renders after hydration: the server renders
   * no content.
   *
   * @cckSemantic tooltip.content.forceMount
   * @cckParity React and Vue only (Radix and Reka); Angular removes the content when it closes.
   * @defaultValue false
   */
  readonly forceMount?: boolean | undefined;
  /**
   * The tag or component to render, in place of the `div`. The part keeps its role, state, ids and handlers. Ignored
   * with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Vue's element override (Reka).
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the content merges onto its first element or component child instead of rendering a `div`. The
   * child keeps `role="tooltip"`, the id and the state markers of the content.
   *
   * @cckSemantic none
   * @cckParity Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * A pointer from the content to the anchor, a child of `TooltipContent`. It renders a `span` that holds a triangle
 * `svg`, is hidden from assistive technology, and is placed by the positioning on the edge that faces the anchor.
 * While it cannot point at the anchor's centre it is hidden with the native `hidden` attribute (see
 * `hideShiftedArrow`). Children replace the triangle: they render inside its `svg`. The gap between the trigger and
 * the content grows by the height of the arrow.
 *
 * @example
 * <TooltipContent>Copy link <TooltipArrow /></TooltipContent>
 *
 * @cckPart arrow
 */
export interface TooltipArrowProps {
  /**
   * The tag or component to render, in place of the `span`. Render an HTML element: an SVG element is not hidden
   * by the `hidden` attribute without a theme rule. Ignored with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Vue's element override (Reka).
   * @defaultValue 'span'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the part merges onto its first element or component child instead of rendering a `span` with the
   * triangle. The child is the whole arrow.
   *
   * @cckSemantic none
   * @cckParity Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
