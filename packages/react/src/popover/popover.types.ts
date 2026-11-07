import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode, RefCallback, RefObject } from 'react';
import type { OverlayAlign, OverlaySide, OverlayVirtualAnchor } from '@cocokits/cdk/positioning';
import type { PopoverAlign, PopoverChangeReason, PopoverSide } from '@cocokits/machines/popover';
import type { CancelableChangeDetails } from '../internal/cancelable-change-details';
import type { FocusOutsideEvent, PointerDownOutsideEvent } from '../internal/dismiss-handlers';
import type { OverlayArrowProps, OverlayPositioningProps } from '../internal/overlay-positioning.types';

export type {
  CancelableChangeDetails,
  FocusOutsideEvent,
  PointerDownOutsideEvent,
  PopoverAlign,
  PopoverChangeReason,
  PopoverSide,
};

/**
 * What `onOpenChange` receives besides the open state: the reason, the event behind it, and `cancel()` to refuse
 * the change.
 */
export type PopoverChangeDetails = CancelableChangeDetails<PopoverChangeReason>;

/** The public state of the Trigger and the Close part, passed to the function form of `render`. */
export interface PopoverState {
  /** Whether the popover is open. */
  readonly open: boolean;
}

/** The public state of the Content, passed to the function form of `render`. */
export interface PopoverContentState extends PopoverState {
  /** The side of the trigger the content sits on after flip, as `data-side` says. */
  readonly side: PopoverSide;
  /** The alignment along the trigger's edge after shift, as `data-align` says. */
  readonly align: PopoverAlign;
}

/**
 * The props the function form of `render` receives: the native props merged with the part's own. Spread all of
 * them, including `ref`, onto one element.
 */
export interface PopoverRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Any `data-*` attribute, such as `data-state` and the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The merged ref: the part's `ref`, the rendered element's own `ref` and the part's internal one. */
  readonly ref: RefCallback<HTMLElement>;
}

/** Props of the {@link PopoverRoot}. The root renders no element: it provides the open state to its parts. */
export interface PopoverRootProps {
  /**
   * The parts of the popover: a trigger, the content and a Close. The root renders no element around them.
   *
   * @cckSemantic popover.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The open state, which makes the popover controlled. A parent that does not update it after
   * `onOpenChange` keeps the old state.
   *
   * @defaultValue false
   * @cckSemantic popover.open
   */
  readonly open?: boolean | undefined;
  /**
   * The initial open state of an uncontrolled popover. The content mounts after hydration, so a popover that is
   * open by default renders closed on the server.
   *
   * @defaultValue false
   * @cckSemantic none
   * @cckParity The uncontrolled start value.
   */
  readonly defaultOpen?: boolean | undefined;
  /**
   * Called for every change the user makes, before it applies: the trigger, Close, Escape, a press outside, or
   * focus leaving the popover. Never when the parent sets `open`. Call `details.cancel()` to refuse the change:
   * an uncontrolled popover keeps its state, and a refused dismissal counts as refused.
   *
   * @cckSemantic popover.openChange
   * @cckParity The change callback of this component.
   */
  readonly onOpenChange?: ((open: boolean, details: PopoverChangeDetails) => void) | undefined;
  /**
   * Whether the popover is modal. A modal popover makes everything outside its content inert (no pointer, focus
   * or assistive-technology access), locks the page scroll, wraps Tab and Shift+Tab inside the content, closes on
   * a press outside without that press reaching the element under it, and gives the content `aria-modal="true"`.
   * Give a modal popover a name (`Popover.Title` or `aria-label`). Switching it while the popover is open takes
   * effect at the next open.
   *
   * @defaultValue false
   * @cckSemantic popover.modal
   * @cckParity Not available in every framework.
   */
  readonly modal?: boolean | undefined;
}

/**
 * The `render` prop of a part: an element, or a function of the merged props and the part's state. The function
 * form does not work from a Server Component.
 */
type RenderProp<S> = ReactElement | ((props: PopoverRenderProps, state: S) => ReactElement);

/** Props of the {@link PopoverTrigger}. Native button props pass through. */
export interface PopoverTriggerProps extends Omit<ComponentPropsWithRef<'button'>, 'color'> {
  /**
   * The trigger label, rendered inside the button as written.
   *
   * @cckSemantic popover.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Whether the rendered element is a native `<button>`. Set `false` when `render` gives another element: it
   * then gets `role="button"`, `tabindex="0"` and Enter and Space activation and no `type`. In development a tag that does not match logs a `CocoKits:` error.
   *
   * @defaultValue true
   * @cckSemantic none
   * @cckParity Tells the part what element `render` produces.
   */
  readonly nativeButton?: boolean | undefined;
  /**
   * Replaces the rendered `<button>`: an element such as `<Button />`, or a function of the merged props and
   * the {@link PopoverState}. The function form must spread all
   * the props it receives, including `ref`, onto one element. An element that is not a `<button>` also needs `nativeButton={false}`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<PopoverState> | undefined;
}

/** Props of the {@link PopoverAnchor}. Native `div` props pass through. */
export interface PopoverAnchorProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /**
   * The content of the anchor, such as the trigger.
   *
   * @cckSemantic popover.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Places the content against the object this ref holds instead of an element; the Anchor then renders nothing.
   * The ref is read when the content opens and when this prop changes. While it is empty the content is not placed.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly virtualRef?: RefObject<OverlayVirtualAnchor | null> | undefined;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props and the {@link PopoverState}.
   * The function form must spread all the props it receives, including `ref`, onto one element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<PopoverState> | undefined;
}

/** Props of the {@link PopoverTitle}. Native `h2` props pass through. */
export interface PopoverTitleProps extends Omit<ComponentPropsWithRef<'h2'>, 'color'> {
  /**
   * The title text.
   *
   * @cckSemantic popover.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Replaces the rendered `<h2>` with the heading you choose, such as `<h3 />`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<PopoverState> | undefined;
}

/** Props of the {@link PopoverDescription}. Native `p` props pass through. */
export interface PopoverDescriptionProps extends Omit<ComponentPropsWithRef<'p'>, 'color'> {
  /**
   * The description text.
   *
   * @cckSemantic popover.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Replaces the rendered `<p>`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<PopoverState> | undefined;
}

/** Props of the {@link PopoverContent}. Native `div` props pass through; give the content an accessible name. */
export interface PopoverContentProps
  extends Omit<ComponentPropsWithRef<'div'>, 'color'>, OverlayPositioningProps, OverlayArrowProps {
  /**
   * The content of the popover: text, form controls and a `Popover.Close`.
   *
   * @cckSemantic popover.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Called when Escape is pressed with this popover on top, before it closes. Call `event.preventDefault()` to keep
   * it open. It is not called for a close request without a key (a back gesture, assistive technology): refuse
   * that one with `details.cancel()` in `onOpenChange`. Refusing Escape or an outside press can leave the user without a way out: keep another way to close it.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onEscapeKeyDown?: ((event: KeyboardEvent) => void) | undefined;
  /**
   * Called when a pointer press lands outside this popover, before it closes. The press is
   * `event.detail.originalEvent`. Call `event.preventDefault()` to keep it open.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onPointerDownOutside?: ((event: PointerDownOutsideEvent) => void) | undefined;
  /**
   * Called when focus moves outside this popover, before it closes. The focus event is
   * `event.detail.originalEvent`. Call `event.preventDefault()` to keep it open.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onFocusOutside?: ((event: FocusOutsideEvent) => void) | undefined;
  /**
   * Called after `onPointerDownOutside` or `onFocusOutside`, with the same event, when a press or focus moves outside this popover.
   * Call `event.preventDefault()` to keep it open.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onInteractOutside?: ((event: PointerDownOutsideEvent | FocusOutsideEvent) => void) | undefined;
  /**
   * Called when the popover opens and focus is about to move into it. Call `event.preventDefault()` to stop
   * CocoKits from moving focus.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onOpenAutoFocus?: ((event: Event) => void) | undefined;
  /**
   * Called when the popover closes and focus is about to return to the trigger. Call `event.preventDefault()`
   * to skip the return.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onCloseAutoFocus?: ((event: Event) => void) | undefined;
  /**
   * Keeps the content in the document while the popover is closed, after hydration: it then has `hidden` and
   * `data-state="closed"`, and the state inside it is kept across open and close. Nothing is rendered on the
   * server. Closed, it has no dismiss layer, no positioning and no focus move.
   *
   * @defaultValue false
   * @cckSemantic popover.content.forceMount
   * @cckParity Not available in every framework.
   */
  readonly forceMount?: boolean | undefined;
  /**
   * The wanted side of the trigger. `start` and `end` follow the text direction. The content flips to the
   * opposite side when it does not fit; `data-side` says where it is.
   *
   * @defaultValue 'bottom'
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
   * {@link PopoverContentState}. The function form must spread all the props it receives, including `ref`, onto
   * one element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<PopoverContentState> | undefined;
}

/** Props of the {@link PopoverArrow}. Native `span` props pass through. */
export interface PopoverArrowProps extends Omit<ComponentPropsWithRef<'span'>, 'color'> {
  /**
   * Replaces the built-in triangle. The arrow is decorative: keep it free of text.
   *
   * @cckSemantic popover.default
   * @cckParity The triangle is built in.
   */
  readonly children?: ReactNode | undefined;
  /**
   * Replaces the rendered `<span>` (the part is hidden with the native `hidden` attribute, which hides HTML
   * elements only): an element, or a function of the merged props and the {@link PopoverState}. The function form
   * must spread all the props it receives, including `ref`, onto one element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<PopoverState> | undefined;
}

/** Props of the {@link PopoverClose}. Native button props pass through. */
export interface PopoverCloseProps extends Omit<ComponentPropsWithRef<'button'>, 'color'> {
  /**
   * The label of the Close button. An icon-only Close needs `aria-label`.
   *
   * @cckSemantic popover.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Whether the rendered element is a native `<button>`. Set `false` when `render` gives another element: it
   * then gets `role="button"`, `tabindex="0"` and Enter and Space activation and no `type`. In development a tag that does not match logs a `CocoKits:` error.
   *
   * @defaultValue true
   * @cckSemantic none
   * @cckParity Tells the part what element `render` produces.
   */
  readonly nativeButton?: boolean | undefined;
  /**
   * Replaces the rendered `<button>`: an element such as `<Button />`, or a function of the merged props and
   * the {@link PopoverState}. The function form must spread all the props it receives, including `ref`, onto
   * one element. An element that is not a `<button>` also needs `nativeButton={false}`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<PopoverState> | undefined;
}

/** A Popover part: a function component with its `displayName`. */
export interface PopoverPart<P, R extends ReactElement | null = ReactElement> {
  (props: P): R;
  displayName: string;
}
