import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode, RefCallback } from 'react';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import type { TooltipAlign, TooltipChangeReason, TooltipSide } from '@cocokits/machines/tooltip';
import type { CancelableChangeDetails } from '../internal/cancelable-change-details';
import type { PointerDownOutsideEvent } from '../internal/dismiss-handlers';
import type { OverlayArrowProps, OverlayPositioningProps } from '../internal/overlay-positioning.types';

export type { CancelableChangeDetails, PointerDownOutsideEvent, TooltipAlign, TooltipChangeReason, TooltipSide };

/**
 * What `onOpenChange` receives besides the open state: the reason, the event behind it, and `cancel()` to refuse
 * the change.
 */
export type TooltipChangeDetails = CancelableChangeDetails<TooltipChangeReason>;

/** The public state of the Trigger, passed to the function form of `render`. */
export interface TooltipState {
  /** Whether the tooltip is shown. */
  readonly open: boolean;
}

/** The public state of the Content, passed to the function form of `render`. */
export interface TooltipContentState extends TooltipState {
  /** The side of the trigger the content sits on after flip, as `data-side` says. */
  readonly side: TooltipSide;
  /** The alignment along the trigger's edge after shift, as `data-align` says. */
  readonly align: TooltipAlign;
}

/**
 * The props the function form of `render` receives: the native props merged with the part's own. Spread all of
 * them, including `ref`, onto one element.
 */
export interface TooltipRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Any `data-*` attribute, such as `data-state` and the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The merged ref: the part's `ref`, the rendered element's own `ref` and the part's internal one. */
  readonly ref: RefCallback<HTMLElement>;
}

/** Props of the {@link TooltipRoot}. The root renders no element: it provides the open state to its parts. */
export interface TooltipRootProps {
  /**
   * The parts of the tooltip: a trigger and the content. The root renders no element around them.
   *
   * @cckSemantic tooltip.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The open state, which makes the tooltip controlled. A parent that does not update it after
   * `onOpenChange` keeps the old state.
   *
   * @defaultValue false
   * @cckSemantic tooltip.open
   */
  readonly open?: boolean | undefined;
  /**
   * The initial open state of an uncontrolled tooltip. The content mounts after hydration, so a tooltip that is
   * open by default renders closed on the server.
   *
   * @defaultValue false
   * @cckSemantic none
   * @cckParity React's uncontrolled mode; Vue has `defaultOpen` too, and Angular has no open state to bind.
   */
  readonly defaultOpen?: boolean | undefined;
  /**
   * Called for every change the user makes, before it applies: hover, focus, Escape, a press outside, the pointer
   * leaving, blur or a press on the trigger. Never when the parent sets `open`. Call `details.cancel()` to refuse
   * the change: an uncontrolled tooltip keeps its state.
   *
   * @cckSemantic tooltip.openChange
   * @cckParity React's change callback; Vue emits `update:open`, and Angular has no open-state event.
   */
  readonly onOpenChange?: ((open: boolean, details: TooltipChangeDetails) => void) | undefined;
  /**
   * Milliseconds between a mouse or pen hover and the tooltip showing. Keyboard focus shows it at once. Unset, it
   * takes the value of the {@link TooltipProviderProps.delayDuration | Provider} around it.
   *
   * @defaultValue 700, from the Provider
   * @cckSemantic tooltip.delay
   * @cckDefaultDiffers Angular reads its delay from CCK_TOOLTIP_DEFAULT_OPTIONS (0), React and Vue from the Provider (700), as Material, Radix and Reka do.
   */
  readonly delayDuration?: number | undefined;
  /**
   * Hides the tooltip at once when the pointer leaves the trigger, and the pointer on the content does not keep it
   * open. The content then is not hoverable, which fails WCAG 1.4.13 (hoverable): use it only when the content adds
   * nothing a pointer user must reach. Unset, it takes the value of the Provider.
   *
   * @defaultValue false, from the Provider
   * @cckSemantic none
   * @cckParity React and Vue only (Radix and Reka); Angular sets it with `disableTooltipInteractivity` in its defaults token.
   */
  readonly disableHoverableContent?: boolean | undefined;
  /**
   * Whether the tooltip never opens. A disabled tooltip is closed and its content is not rendered. Turning it on
   * while the tooltip is open closes it at once and calls no `onOpenChange`; an uncontrolled tooltip stays closed
   * when it is turned off again.
   *
   * @defaultValue false
   * @cckSemantic tooltip.disabled
   */
  readonly disabled?: boolean | undefined;
}

/** Props of the {@link TooltipProvider}. The provider renders no element: it holds the delay group and the defaults. */
export interface TooltipProviderProps {
  /**
   * The tooltips of the group. The provider renders no element around them.
   *
   * @cckSemantic none
   * @cckParity React and Vue only (Radix and Reka); Angular sets its defaults with a token.
   */
  readonly children?: ReactNode | undefined;
  /**
   * Milliseconds between a mouse or pen hover and a tooltip showing, for every tooltip inside that sets no
   * `delayDuration` of its own.
   *
   * @defaultValue 700
   * @cckSemantic none
   * @cckParity React and Vue only (Radix and Reka); Angular sets its delays with CCK_TOOLTIP_DEFAULT_OPTIONS.
   */
  readonly delayDuration?: number | undefined;
  /**
   * Milliseconds after a tooltip of the group closes during which the next hover opens without delay. While one
   * tooltip of the group is open, the next hover opens without delay too. `0` or less turns this off. A nested
   * Provider forms its own group.
   *
   * @defaultValue 300
   * @cckSemantic none
   * @cckParity React and Vue only (Radix and Reka); Angular has no tooltip group.
   */
  readonly skipDelayDuration?: number | undefined;
  /**
   * The default of `disableHoverableContent` for every tooltip inside. It fails WCAG 1.4.13 (hoverable): see the
   * Root prop.
   *
   * @defaultValue false
   * @cckSemantic none
   * @cckParity React and Vue only (Radix and Reka); Angular sets it with `disableTooltipInteractivity` in its defaults token.
   */
  readonly disableHoverableContent?: boolean | undefined;
}

/**
 * The `render` prop of a part: an element, or a function of the merged props and the part's state. The function
 * form does not work from a Server Component.
 */
type RenderProp<S> = ReactElement | ((props: TooltipRenderProps, state: S) => ReactElement);

/** Props of the {@link TooltipTrigger}. Native button props pass through. */
export interface TooltipTriggerProps extends Omit<ComponentPropsWithRef<'button'>, 'color'> {
  /**
   * The trigger content, rendered inside the button as written. An icon-only trigger needs `aria-label`: the
   * name must not depend on the tooltip.
   *
   * @cckSemantic tooltip.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Whether the rendered element is a native `<button>`. Set `false` when `render` gives another element: it
   * then gets `tabindex="0"` and no `type`. In development a tag that does not match logs a `CocoKits:` error.
   *
   * @defaultValue true
   * @cckSemantic none
   * @cckParity React's element kind for `render` (Base UI); Vue decides it with `as`.
   */
  readonly nativeButton?: boolean | undefined;
  /**
   * Replaces the rendered `<button>`: an element such as `<Button />` or a link, or a function of the merged
   * props and the {@link TooltipState}. The element must be focusable. The function form must spread all the
   * props it receives, including `ref`, onto one element. An element that is not a `<button>` also needs `nativeButton={false}`.
   *
   * @cckSemantic none
   * @cckParity React's element override (Base UI); Angular puts a second directive on the element and Vue uses `as` or `asChild`.
   */
  readonly render?: RenderProp<TooltipState> | undefined;
}

/** Props of the {@link TooltipContent}. Native `div` props pass through. */
export interface TooltipContentProps
  extends Omit<ComponentPropsWithRef<'div'>, 'color'>, OverlayPositioningProps, OverlayArrowProps {
  /**
   * The text of the tooltip. Keep it free of interactive content: it never takes focus. Text-only children (strings
   * and numbers) are also the description of the trigger, which stays in the document while the tooltip is closed.
   *
   * @cckSemantic tooltip.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The description of the trigger as text, when the children are not text only, for example an icon with a
   * caption. It is read by assistive technology while the tooltip is closed, in a hidden element after hydration;
   * the visible content is hidden from assistive technology then and does not carry the label itself. A text equal
   * to the trigger's own `aria-label` adds nothing and is dropped.
   *
   * @cckSemantic tooltip.content.aria-label
   */
  readonly 'aria-label'?: string | undefined;
  /**
   * Called when Escape is pressed with this tooltip on top, before it closes. Call `event.preventDefault()` to keep
   * it open. It is not called for a close request without a key (a back gesture, assistive technology): refuse
   * that one with `details.cancel()` in `onOpenChange`. WCAG 1.4.13 asks for a tooltip that stays dismissible: refuse Escape only when you offer another way to hide it.
   *
   * @cckSemantic none
   * @cckParity React and Vue only (Radix and Reka); Angular refuses with `disableClose` on the root.
   */
  readonly onEscapeKeyDown?: ((event: KeyboardEvent) => void) | undefined;
  /**
   * Called when a pointer press lands outside this tooltip, before it closes. The press is
   * `event.detail.originalEvent`. Call `event.preventDefault()` to keep it open.
   *
   * @cckSemantic none
   * @cckParity React and Vue only (Radix and Reka); Angular refuses with `disableClose` on the root.
   */
  readonly onPointerDownOutside?: ((event: PointerDownOutsideEvent) => void) | undefined;
  /**
   * Keeps the content in the document while the tooltip is closed, after hydration: it then has `hidden` and
   * `data-state="closed"`. Nothing is rendered on the server. Closed, it has no dismiss layer and no positioning.
   *
   * @defaultValue false
   * @cckSemantic tooltip.content.forceMount
   * @cckParity React and Vue only (Radix and Reka); Angular never keeps the content mounted.
   */
  readonly forceMount?: boolean | undefined;
  /**
   * The wanted side of the trigger. `start` and `end` follow the text direction. The content flips to the
   * opposite side when it does not fit; `data-side` says where it is.
   *
   * @defaultValue 'top'
   */
  readonly side?: OverlaySide | undefined;
  /**
   * The wanted alignment along the trigger's edge. The content shifts to stay in view; `data-align` says where
   * it is.
   *
   * @defaultValue 'center'
   */
  readonly align?: OverlayAlign | undefined;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props and the
   * {@link TooltipContentState}. The function form must spread all the props it receives, including `ref`, onto
   * one element.
   *
   * @cckSemantic none
   * @cckParity React's element override (Base UI); Angular and Vue use their own element mechanism.
   */
  readonly render?: RenderProp<TooltipContentState> | undefined;
}

/** Props of the {@link TooltipArrow}. Native `span` props pass through. */
export interface TooltipArrowProps extends Omit<ComponentPropsWithRef<'span'>, 'color'> {
  /**
   * Replaces the built-in triangle. The arrow is decorative: keep it free of text.
   *
   * @cckSemantic tooltip.default
   * @cckParity The triangle is built in; Angular replaces it with the content of the attribute element.
   */
  readonly children?: ReactNode | undefined;
  /**
   * Replaces the rendered `<span>` (the part is hidden with the native `hidden` attribute, which hides HTML
   * elements only): an element, or a function of the merged props and the {@link TooltipState}. The function form
   * must spread all the props it receives, including `ref`, onto one element.
   *
   * @cckSemantic none
   * @cckParity React's element override (Base UI); Angular puts the directive on any element and Vue uses `as` or `asChild`.
   */
  readonly render?: RenderProp<TooltipState> | undefined;
}

/** A Tooltip part: a function component with its `displayName`. */
export interface TooltipPart<P> {
  (props: P): ReactElement;
  displayName: string;
}
