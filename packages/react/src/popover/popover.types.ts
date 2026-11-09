import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode, RefCallback, RefObject } from 'react';
import type { OverlayAlign, OverlaySide, OverlayVirtualAnchor } from '@cocokits/cdk/positioning';
import type { PopoverAlign, PopoverChangeReason, PopoverSide } from '@cocokits/machines/popover';
import type { CancelableChangeDetails } from '../internal/cancelable-change-details';
import type { FocusOutsideEvent, PointerDownOutsideEvent } from '../internal/dismiss-handlers';
import type { OverlayArrowProps, OverlayPositioningProps } from '../internal/overlay-positioning.types';
import type { RenderProp } from '../internal/render-element';

export type {
  CancelableChangeDetails,
  FocusOutsideEvent,
  PointerDownOutsideEvent,
  PopoverAlign,
  PopoverChangeReason,
  PopoverSide,
};

/**
 * What `onOpenChange` receives besides the open state: the `reason`, the `event` behind the change, and `cancel()`
 * to refuse the change.
 */
export type PopoverChangeDetails = CancelableChangeDetails<PopoverChangeReason>;

/** The state of the Trigger, Anchor, Title, Description, Arrow and Close that `render` receives. */
export interface PopoverState {
  /** Whether the popover is open. */
  readonly open: boolean;
}

/** The state of the Content that the function form of `render` receives. */
export interface PopoverContentState extends PopoverState {
  /** The side of the anchor that the content sits on after a flip, the same as `data-side`. */
  readonly side: PopoverSide;
  /** The alignment along the edge of the anchor after a shift, the same as `data-align`. */
  readonly align: PopoverAlign;
}

/**
 * The props that the function form of `render` receives: the native props merged with the props of the part. Pass
 * all of them, `ref` included, to one element.
 */
export interface PopoverRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Any `data-*` attribute, such as `data-state` and the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The merged ref: the `ref` of the part, the `ref` of the rendered element and the `ref` of the part itself. */
  readonly ref: RefCallback<HTMLElement>;
}

/** Props of the {@link PopoverRoot}. The Root renders no element. It gives the open state to its parts. */
export interface PopoverRootProps {
  /**
   * The parts of the popover: a `Popover.Trigger` and a `Popover.Content`. The Root renders no element around
   * them. When not set, nothing renders.
   *
   * @example
   * <Popover.Root>
   *   <Popover.Trigger>Share</Popover.Trigger>
   *   <Popover.Content aria-label="Share">...</Popover.Content>
   * </Popover.Root>
   * @cckSemantic popover.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Whether the popover is open. Setting it makes the open state controlled. If you do not update it after
   * `onOpenChange`, the old state stays.
   *
   * @defaultValue false
   * @cckSemantic popover.open
   */
  readonly open?: boolean | undefined;
  /**
   * The start open state of a popover that you do not control with `open`. The content mounts after hydration, so
   * a popover that starts open is closed on the server.
   *
   * @defaultValue false
   * @cckSemantic none
   * @cckParity The uncontrolled start value.
   */
  readonly defaultOpen?: boolean | undefined;
  /**
   * Called before the user opens or closes the popover. It receives the new open state and a details object with
   * the `reason`, the `event` and `cancel()`.
   *
   * The user can do this with the trigger, a Close, Escape, a press outside, or by moving the focus away. Call
   * `details.cancel()` to refuse the change. It is never called when you change `open` yourself.
   *
   * @example
   * <Popover.Root
   *   onOpenChange={(open, details) => {
   *     if (!open && details.reason === 'outside-press') details.cancel();
   *   }}
   * >
   *   ...
   * </Popover.Root>
   * @cckSemantic popover.openChange
   * @cckParity The change callback of this component.
   */
  readonly onOpenChange?: ((open: boolean, details: PopoverChangeDetails) => void) | undefined;
  /**
   * Whether the popover is modal. A modal popover makes the page outside its content inert and stops the page from
   * scrolling. Tab and Shift+Tab stay inside the content.
   *
   * A press outside closes it and does not reach the element under it. The content gets `aria-modal="true"`, so
   * give it a name with a `Popover.Title` or an `aria-label`.
   *
   * A change while the popover is open applies at the next open.
   *
   * @defaultValue false
   * @cckSemantic popover.modal
   * @cckParity Not available in every framework.
   */
  readonly modal?: boolean | undefined;
}

/** Props of the {@link PopoverTrigger}. Native button props pass through. */
export interface PopoverTriggerProps extends Omit<ComponentPropsWithRef<'button'>, 'color'> {
  /**
   * The label of the trigger, which is also its accessible name. When not set, the trigger has no name, so you
   * must give it an `aria-label`.
   *
   * @example
   * <Popover.Trigger>Share</Popover.Trigger>
   * @cckSemantic popover.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Whether the rendered element is a native `<button>`. Set it to `false` when `render` gives another element.
   *
   * That element then gets `role="button"`, `tabindex="0"` and activation by Enter and Space, and no `type`. In
   * development, a tag that does not match logs an error.
   *
   * @defaultValue true
   * @cckSemantic none
   * @cckParity Tells the part what element `render` produces.
   */
  readonly nativeButton?: boolean | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element. An element that is not a `<button>` also needs
   * `nativeButton={false}`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<PopoverRenderProps, PopoverState> | undefined;
}

/** Props of the {@link PopoverAnchor}. Native `div` props pass through. */
export interface PopoverAnchorProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /**
   * The content that the popover lines up with, such as a field and the trigger. When not set, the Anchor is
   * empty.
   *
   * @example
   * <Popover.Anchor>
   *   <input aria-label="City" />
   *   <Popover.Trigger>Pick</Popover.Trigger>
   * </Popover.Anchor>
   * @cckSemantic popover.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * A ref to an object that the content lines up with, in place of an element. The Anchor then renders nothing.
   *
   * The content reads the ref when it opens and when this prop changes. While the ref is empty, the content is not
   * placed. When not set, the content lines up with the Anchor element.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly virtualRef?: RefObject<OverlayVirtualAnchor | null> | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<PopoverRenderProps, PopoverState> | undefined;
}

/** Props of the {@link PopoverTitle}. Native `h2` props pass through. */
export interface PopoverTitleProps extends Omit<ComponentPropsWithRef<'h2'>, 'color'> {
  /**
   * The text of the title, which names the popover. When not set, the title is empty, so give the content an
   * `aria-label`.
   *
   * @example
   * <Popover.Title>Share this page</Popover.Title>
   * @cckSemantic popover.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<PopoverRenderProps, PopoverState> | undefined;
}

/** Props of the {@link PopoverDescription}. Native `p` props pass through. */
export interface PopoverDescriptionProps extends Omit<ComponentPropsWithRef<'p'>, 'color'> {
  /**
   * The text that describes the popover. When not set, the description is empty.
   *
   * @example
   * <Popover.Description>Anyone with the link can view it.</Popover.Description>
   * @cckSemantic popover.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<PopoverRenderProps, PopoverState> | undefined;
}

/** Props of the {@link PopoverContent}. Native `div` props pass through. Give the content an accessible name. */
export interface PopoverContentProps
  extends Omit<ComponentPropsWithRef<'div'>, 'color'>, OverlayPositioningProps, OverlayArrowProps {
  /**
   * The content of the popover: text, form controls and a `Popover.Close`. When not set, the popover is empty.
   *
   * @example
   * <Popover.Content>
   *   <Popover.Title>Share this page</Popover.Title>
   *   <Popover.Close>Done</Popover.Close>
   * </Popover.Content>
   * @cckSemantic popover.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Called when the user presses Escape while this popover is on top, before it closes. Call
   * `event.preventDefault()` to keep it open.
   *
   * It is not called for a close request without a key, such as a back gesture. Refuse that one with
   * `details.cancel()` in `onOpenChange`. If you refuse Escape, give the user another way to close the popover.
   *
   * @example
   * <Popover.Content onEscapeKeyDown={(event) => saving && event.preventDefault()}>...</Popover.Content>
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onEscapeKeyDown?: ((event: KeyboardEvent) => void) | undefined;
  /**
   * Called when the user presses a pointer outside this popover, before it closes. Call `event.preventDefault()`
   * to keep it open.
   *
   * The press is `event.detail.originalEvent`.
   *
   * @example
   * <Popover.Content onPointerDownOutside={(event) => event.preventDefault()}>...</Popover.Content>
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onPointerDownOutside?: ((event: PointerDownOutsideEvent) => void) | undefined;
  /**
   * Called when the focus moves outside this popover, before it closes. Call `event.preventDefault()` to keep it
   * open.
   *
   * The focus event is `event.detail.originalEvent`.
   *
   * @example
   * <Popover.Content onFocusOutside={(event) => event.preventDefault()}>...</Popover.Content>
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onFocusOutside?: ((event: FocusOutsideEvent) => void) | undefined;
  /**
   * Called after `onPointerDownOutside` or `onFocusOutside`, with the same event. Call `event.preventDefault()` to
   * keep the popover open.
   *
   * @example
   * <Popover.Content onInteractOutside={(event) => event.preventDefault()}>...</Popover.Content>
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onInteractOutside?: ((event: PointerDownOutsideEvent | FocusOutsideEvent) => void) | undefined;
  /**
   * Called when the popover opens and the focus is about to move into it. Call `event.preventDefault()` to keep
   * the focus where it is, or to move it yourself.
   *
   * @example
   * <Popover.Content onOpenAutoFocus={(event) => { event.preventDefault(); nameInput.current?.focus(); }}>...</Popover.Content>
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onOpenAutoFocus?: ((event: Event) => void) | undefined;
  /**
   * Called when the popover closes and the focus is about to return to the trigger. Call `event.preventDefault()`
   * to skip the return and move the focus yourself.
   *
   * @example
   * <Popover.Content onCloseAutoFocus={(event) => { event.preventDefault(); search.current?.focus(); }}>...</Popover.Content>
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onCloseAutoFocus?: ((event: Event) => void) | undefined;
  /**
   * Whether the content stays in the document while the popover is closed, after hydration. The closed content has
   * `hidden` and `data-state="closed"`, and keeps the state of its children.
   *
   * Nothing renders on the server. Closed content has no dismiss layer, no position and no focus move.
   *
   * @defaultValue false
   * @cckSemantic popover.content.forceMount
   * @cckParity Not available in every framework.
   */
  readonly forceMount?: boolean | undefined;
  /**
   * The side of the trigger that the content should sit on. `start` and `end` follow the text direction.
   *
   * The content flips to the other side when it does not fit, and `data-side` says where it is.
   *
   * @defaultValue 'bottom'
   */
  readonly side?: OverlaySide | undefined;
  /**
   * The alignment of the content along the edge of the trigger. The content shifts to stay in view, and
   * `data-align` says where it is.
   *
   * @defaultValue 'center'
   */
  readonly align?: OverlayAlign | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<PopoverRenderProps, PopoverContentState> | undefined;
}

/** Props of the {@link PopoverArrow}. Native `span` props pass through. */
export interface PopoverArrowProps extends Omit<ComponentPropsWithRef<'span'>, 'color'> {
  /**
   * Your own shape for the arrow. The arrow is decorative, so keep it free of text. When not set, the arrow is a
   * built-in triangle.
   *
   * @example
   * <Popover.Arrow>
   *   <svg width="10" height="5" viewBox="0 0 10 5" aria-hidden="true">
   *     <path d="M0 0 L5 5 L10 0" />
   *   </svg>
   * </Popover.Arrow>
   * @cckSemantic popover.default
   * @cckParity The triangle is built in.
   */
  readonly children?: ReactNode | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element. The Arrow hides with the native `hidden` attribute, which hides
   * HTML elements only.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<PopoverRenderProps, PopoverState> | undefined;
}

/** Props of the {@link PopoverClose}. Native button props pass through. */
export interface PopoverCloseProps extends Omit<ComponentPropsWithRef<'button'>, 'color'> {
  /**
   * The label of the Close button, which is also its accessible name. When not set, the button has no name, so you
   * must give it an `aria-label`.
   *
   * @example
   * <Popover.Close>Done</Popover.Close>
   * @cckSemantic popover.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Whether the rendered element is a native `<button>`. Set it to `false` when `render` gives another element.
   *
   * That element then gets `role="button"`, `tabindex="0"` and activation by Enter and Space, and no `type`. In
   * development, a tag that does not match logs an error.
   *
   * @defaultValue true
   * @cckSemantic none
   * @cckParity Tells the part what element `render` produces.
   */
  readonly nativeButton?: boolean | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders its own element. An element that is not a `<button>` also needs
   * `nativeButton={false}`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<PopoverRenderProps, PopoverState> | undefined;
}

/** A Popover part: a function component with its `displayName`. */
export interface PopoverPart<P, R extends ReactElement | null = ReactElement> {
  (props: P): R;
  displayName: string;
}
