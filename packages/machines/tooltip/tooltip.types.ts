import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';

/**
 * Why the tooltip opened or closed.
 *
 * @cckValue hover - The pointer rested on the trigger.
 * @cckValue focus - The trigger got the focus from the keyboard.
 * @cckValue escape - The user pressed Escape.
 * @cckValue outside-press - The user pressed outside the tooltip.
 * @cckValue pointer-leave - The pointer left the trigger and the content.
 * @cckValue blur - The focus left the trigger.
 * @cckValue press - The user pressed the trigger.
 * @cckValue scroll - A container of the trigger scrolled.
 */
export type TooltipChangeReason =
  'hover' | 'focus' | 'escape' | 'outside-press' | 'pointer-leave' | 'blur' | 'press' | 'scroll';

/**
 * How the trigger is described. The adapter computes it from what it reports about the description text.
 *
 * @cckValue described - A hidden description element exists, and the `aria-describedby` of the trigger names it.
 * @cckValue suppressed - The text equals the `aria-label` of the trigger, so nothing is added.
 * @cckValue none - There is no description text. The content describes the trigger while it is mounted.
 */
export type TooltipDescription = 'described' | 'suppressed' | 'none';

/** The side of the trigger the content sits on. `start` and `end` follow the direction. */
export type TooltipSide = OverlaySide;

/** How the content lines up along the trigger's edge. */
export type TooltipAlign = OverlayAlign;

/** Inputs of `getTooltipProps` and `transitionTooltip`. */
export interface TooltipState {
  /** The SSR-stable id of the tooltip, from the adapter. */
  readonly id: string;
  /** The open model. */
  readonly open: boolean;
  /**
   * Whether the content is in the document: `open`, or closed with an exit animation still running.
   * @defaultValue the value of `open`
   */
  readonly mounted?: boolean | undefined;
  /**
   * Whether the content is kept in the document while closed and its exit animation is over (force-mounted):
   * the content is then hidden with the native `hidden` attribute.
   * @defaultValue false
   */
  readonly keptClosed?: boolean | undefined;
  /**
   * Whether the arrow cannot point at the anchor (the content shifted along the edge), as the positioning module
   * reports it: the arrow is then hidden with the native `hidden` attribute.
   * @defaultValue false
   */
  readonly arrowHidden?: boolean | undefined;
  /** Never opens and shows closed while true. @defaultValue false */
  readonly disabled?: boolean | undefined;
  /** Milliseconds between a mouse or pen hover and the tooltip showing. @defaultValue 700 */
  readonly delay?: number | undefined;
  /** Milliseconds between the pointer leaving and the tooltip hiding; at least `TOOLTIP_LEAVE_GRACE_MS` (100) applies so the content stays hoverable. @defaultValue 0 */
  readonly closeDelay?: number | undefined;
  /**
   * The pointer leaving the trigger hides the tooltip at once, and the pointer on the content does not keep
   * it open. The content then is not hoverable, which fails WCAG 1.4.13 (hoverable); use it only when the
   * content adds nothing a pointer user must reach.
   * @defaultValue false
   */
  readonly disableHoverableContent?: boolean | undefined;
  /** A press on the trigger does not close the tooltip. @defaultValue false */
  readonly disableClosingTrigger?: boolean | undefined;
  /**
   * How the trigger is described; see {@link TooltipDescription}. Report `none` on the server and for the
   * first client render, then the real answer after mount. A disabled tooltip is always treated as `none`.
   * @defaultValue 'none'
   */
  readonly description?: TooltipDescription | undefined;
  /** The resolved side, from the adapter's placement state. @defaultValue 'top' */
  readonly side?: TooltipSide | undefined;
  /** The resolved alignment, from the adapter's placement state. @defaultValue 'center' */
  readonly align?: TooltipAlign | undefined;
  /**
   * Whether the last input was the keyboard (`isFocusVisible` of the cdk focus-visible tracker). Called
   * when the trigger receives focus; without it focus never opens the tooltip.
   */
  readonly isFocusVisible?: (() => boolean) | undefined;
}

/** The events the handlers send. */
export type TooltipEvent =
  | { readonly type: 'TRIGGER.POINTER_ENTER'; readonly pointerType: string; readonly event: Event }
  | { readonly type: 'TRIGGER.POINTER_LEAVE'; readonly event: Event }
  | { readonly type: 'TRIGGER.POINTER_DOWN'; readonly event: Event }
  | { readonly type: 'TRIGGER.FOCUS'; readonly focusVisible: boolean; readonly event: Event }
  | { readonly type: 'TRIGGER.BLUR'; readonly event: Event }
  | { readonly type: 'CONTENT.POINTER_ENTER'; readonly event: Event }
  | { readonly type: 'CONTENT.POINTER_LEAVE'; readonly event: Event }
  /** A scrolling ancestor of the trigger (the document included) scrolled. */
  | { readonly type: 'ANCESTOR.SCROLL'; readonly event: Event }
  /** The layer stack asked the tooltip to close. */
  | { readonly type: 'CONTENT.DISMISS'; readonly reason: 'escape' | 'outside-press'; readonly event: Event | null };

/** An open change to apply after `delay` milliseconds. */
export interface TooltipSchedule {
  /** The requested open state. */
  readonly open: boolean;
  /** Why. */
  readonly reason: TooltipChangeReason;
  /** Milliseconds to wait; `0` applies at once. */
  readonly delay: number;
}

/**
 * What the adapter does after an event: it cancels the pending timer, then starts `schedule` when there
 * is one (a delay of `0` applies at once). `null` means the event is ignored and the timer stays.
 */
export interface TooltipTransition {
  /** The open change to apply, after its delay. */
  readonly schedule?: TooltipSchedule;
}

/** The ids of the parts that link to each other. */
export interface TooltipIds {
  /** The trigger id. */
  readonly trigger: string;
  /** The content id. */
  readonly content: string;
  /** The id of the hidden description element (see {@link TooltipDescription}). */
  readonly description: string;
}

/** Props shared by every part. */
export interface TooltipPartProps {
  /** The part's class from the anatomy. */
  readonly class: string;
}

/** Props of the trigger. */
export interface TooltipTriggerProps extends TooltipPartProps {
  /** The trigger id. */
  readonly id: string;
  /**
   * The description id when `described`, nothing when `suppressed`, the content id while the content is
   * mounted when `none`. The adapter joins it with the author's own ids.
   */
  readonly 'aria-describedby'?: string | undefined;
  /** `open` or `closed`. */
  readonly 'data-state': 'open' | 'closed';
  /** Sends `TRIGGER.POINTER_ENTER` with the pointer type. */
  readonly onPointerEnter: (event: PointerEvent) => void;
  /** Sends `TRIGGER.POINTER_LEAVE`. */
  readonly onPointerLeave: (event: PointerEvent) => void;
  /** Sends `TRIGGER.POINTER_DOWN`. */
  readonly onPointerDown: (event: PointerEvent) => void;
  /** Sends `TRIGGER.FOCUS` with the focus-visible answer. */
  readonly onFocus: (event: FocusEvent) => void;
  /** Sends `TRIGGER.BLUR`. */
  readonly onBlur: (event: FocusEvent) => void;
}

/** Props of the content. It is never focusable. */
export interface TooltipContentProps extends TooltipPartProps {
  /** The content id. */
  readonly id: string;
  /** Always `'tooltip'`. */
  readonly role: 'tooltip';
  /** `'true'` when the tooltip is `described` or `suppressed`: the hidden description is what is announced. */
  readonly 'aria-hidden'?: 'true' | undefined;
  /** `true` while the closed content is kept mounted (native `hidden`); otherwise absent. */
  readonly hidden?: true | undefined;
  /** `open` or `closed`. */
  readonly 'data-state': 'open' | 'closed';
  /** The resolved side. */
  readonly 'data-side': TooltipSide;
  /** The resolved alignment. */
  readonly 'data-align': TooltipAlign;
  /** Sends `CONTENT.POINTER_ENTER`, so the pointer on the content keeps the tooltip open. */
  readonly onPointerEnter: (event: PointerEvent) => void;
  /** Sends `CONTENT.POINTER_LEAVE`. */
  readonly onPointerLeave: (event: PointerEvent) => void;
}

/** Props of the arrow. */
export interface TooltipArrowProps extends TooltipPartProps {
  /** Always `'true'`: the arrow is decorative. */
  readonly 'aria-hidden': 'true';
  /** `true` while the arrow cannot point at the anchor (native `hidden`); otherwise absent. */
  readonly hidden?: true | undefined;
}

/** What `getTooltipProps` returns. The root renders no element, so it has no props. */
export interface TooltipParts {
  /** The trigger props. */
  readonly trigger: TooltipTriggerProps;
  /** The content props. */
  readonly content: TooltipContentProps;
  /** The arrow props. */
  readonly arrow: TooltipArrowProps;
}
