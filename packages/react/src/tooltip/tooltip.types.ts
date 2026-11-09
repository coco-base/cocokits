import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode, RefCallback } from 'react';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import type { TooltipAlign, TooltipChangeReason, TooltipSide } from '@cocokits/machines/tooltip';
import type { CancelableChangeDetails } from '../internal/cancelable-change-details';
import type { PointerDownOutsideEvent } from '../internal/dismiss-handlers';
import type { OverlayArrowProps, OverlayPositioningProps } from '../internal/overlay-positioning.types';
import type { RenderProp } from '../internal/render-element';

export type { CancelableChangeDetails, PointerDownOutsideEvent, TooltipAlign, TooltipChangeReason, TooltipSide };

/**
 * What `onOpenChange` receives besides the open state: the `reason`, the `event` behind the change, and `cancel()`
 * to refuse the change.
 */
export type TooltipChangeDetails = CancelableChangeDetails<TooltipChangeReason>;

/** The state of the Trigger and the Arrow that the function form of `render` receives. */
export interface TooltipState {
  /** Whether the tooltip shows. */
  readonly open: boolean;
}

/** The state of the Content that the function form of `render` receives. */
export interface TooltipContentState extends TooltipState {
  /** The side of the trigger that the content sits on after a flip, the same as `data-side`. */
  readonly side: TooltipSide;
  /** The alignment along the edge of the trigger after a shift, the same as `data-align`. */
  readonly align: TooltipAlign;
}

/**
 * The props that the function form of `render` receives: the native props merged with the props of the part. Pass
 * all of them, `ref` included, to one element.
 */
export interface TooltipRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Any `data-*` attribute, such as `data-state` and the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The merged ref: the `ref` of the part, the `ref` of the rendered element and the `ref` of the part itself. */
  readonly ref: RefCallback<HTMLElement>;
}

/** Props of the {@link TooltipRoot}. The Root renders no element. It gives the open state to its parts. */
export interface TooltipRootProps {
  /**
   * The parts of the tooltip: a `Tooltip.Trigger` and a `Tooltip.Content`. The Root renders no element around
   * them. When not set, nothing renders.
   *
   * @example
   * <Tooltip.Root>
   *   <Tooltip.Trigger>Save</Tooltip.Trigger>
   *   <Tooltip.Content>Save your changes</Tooltip.Content>
   * </Tooltip.Root>
   * @cckSemantic tooltip.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Whether the tooltip shows. Setting it makes the open state controlled. If you do not update it after
   * `onOpenChange`, the old state stays.
   *
   * @defaultValue false
   * @cckSemantic tooltip.open
   */
  readonly open?: boolean | undefined;
  /**
   * The start open state of a tooltip that you do not control with `open`. The content mounts after hydration, so
   * a tooltip that starts open is closed on the server.
   *
   * @defaultValue false
   * @cckSemantic none
   * @cckParity The uncontrolled start value.
   */
  readonly defaultOpen?: boolean | undefined;
  /**
   * Called before the tooltip shows or hides by the user. It receives the new open state and a details object with
   * the `reason`, the `event` and `cancel()`.
   *
   * The user can do this by hover, focus, Escape, a press outside or on the trigger, or by moving the pointer or
   * the focus away. Call `details.cancel()` to refuse the change. It is never called when you change `open`
   * yourself.
   *
   * @example
   * <Tooltip.Root onOpenChange={(open, details) => console.log(open, details.reason)}>
   *   ...
   * </Tooltip.Root>
   * @cckSemantic tooltip.openChange
   * @cckParity The change callback of this component.
   */
  readonly onOpenChange?: ((open: boolean, details: TooltipChangeDetails) => void) | undefined;
  /**
   * The time in milliseconds between a mouse or pen hover and the tooltip showing. Keyboard focus shows it at once.
   * When not set, it takes the value of the {@link TooltipProviderProps.delayDuration | Provider} around it.
   *
   * @defaultValue 700, from the Provider
   * @cckSemantic tooltip.delay
   * @cckDefaultDiffers The delay belongs to the Provider.
   */
  readonly delayDuration?: number | undefined;
  /**
   * Whether the tooltip hides at once when the pointer leaves the trigger. The pointer on the content then does not
   * keep it open. When not set, it takes the value of the Provider.
   *
   * The content then cannot be hovered, which fails WCAG 1.4.13. Use it only when the content holds nothing that a
   * pointer user must reach.
   *
   * @defaultValue false, from the Provider
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly disableHoverableContent?: boolean | undefined;
  /**
   * Whether the tooltip never opens. A disabled tooltip is closed, and its content is not rendered.
   *
   * Turning it on while the tooltip shows hides it at once and calls no `onOpenChange`. A tooltip that you do not
   * control stays closed when you turn it off again.
   *
   * @defaultValue false
   * @cckSemantic tooltip.disabled
   */
  readonly disabled?: boolean | undefined;
}

/** Props of the {@link TooltipProvider}. The Provider renders no element. It holds the delay group and the defaults. */
export interface TooltipProviderProps {
  /**
   * The tooltips of the group. The Provider renders no element around them. When not set, nothing renders.
   *
   * @example
   * <Tooltip.Provider delayDuration={400}>
   *   <main>...</main>
   * </Tooltip.Provider>
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly children?: ReactNode | undefined;
  /**
   * The time in milliseconds between a mouse or pen hover and a tooltip showing. It applies to every tooltip inside
   * that sets no `delayDuration` of its own.
   *
   * @defaultValue 700
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly delayDuration?: number | undefined;
  /**
   * The time in milliseconds after a tooltip of the group hides, during which the next hover shows without delay.
   * While a tooltip of the group shows, the next hover also shows without delay.
   *
   * `0` or less turns this off. A Provider inside another Provider makes its own group.
   *
   * @defaultValue 300
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly skipDelayDuration?: number | undefined;
  /**
   * The default of `disableHoverableContent` for every tooltip inside. Like the prop of the Root, it fails WCAG
   * 1.4.13.
   *
   * @defaultValue false
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly disableHoverableContent?: boolean | undefined;
}

/** Props of the {@link TooltipTrigger}. Native button props pass through. */
export interface TooltipTriggerProps extends Omit<ComponentPropsWithRef<'button'>, 'color'> {
  /**
   * The content of the trigger, which is also its accessible name. When not set, the trigger has no name, so you
   * must give it an `aria-label`.
   *
   * A trigger with only an icon needs an `aria-label`, because its name must not depend on the tooltip.
   *
   * @example
   * <Tooltip.Trigger aria-label="Save">
   *   <svg aria-hidden="true">...</svg>
   * </Tooltip.Trigger>
   * @cckSemantic tooltip.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Whether the rendered element is a native `<button>`. Set it to `false` when `render` gives another element.
   *
   * That element then gets `tabindex="0"` and no `type`. In development, a tag that does not match logs an error.
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
   * When not set, the part renders its own element. The element must take the focus, and one that is not a
   * `<button>` also needs `nativeButton={false}`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<TooltipRenderProps, TooltipState> | undefined;
}

/** Props of the {@link TooltipContent}. Native `div` props pass through. */
export interface TooltipContentProps
  extends Omit<ComponentPropsWithRef<'div'>, 'color'>, OverlayPositioningProps, OverlayArrowProps {
  /**
   * The text of the tooltip. It never takes the focus, so keep links and buttons out of it. When not set, the
   * tooltip is empty.
   *
   * Children of text only, strings and numbers, also describe the trigger. That description stays in the document
   * while the tooltip is closed.
   *
   * @example
   * <Tooltip.Content>Save your changes</Tooltip.Content>
   * @cckSemantic tooltip.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The description of the trigger as text, for children that are not only text, such as an icon with a caption.
   * When not set, text children describe the trigger.
   *
   * Screen readers read it while the tooltip is closed, from a hidden element after hydration. Then they skip the
   * visible content. A text equal to the `aria-label` of the trigger adds nothing, so it is dropped.
   *
   * @cckSemantic tooltip.content.aria-label
   */
  readonly 'aria-label'?: string | undefined;
  /**
   * Called when the user presses Escape while this tooltip is on top, before it hides. Call
   * `event.preventDefault()` to keep it open.
   *
   * It is not called for a close request without a key, such as a back gesture. Refuse that one with
   * `details.cancel()` in `onOpenChange`. WCAG 1.4.13 asks that the user can hide a tooltip, so refuse Escape only
   * while another way hides it. Moving the pointer or the focus away still hides the tooltip.
   *
   * @example
   * const [saving, setSaving] = useState(false);
   * <Tooltip.Content onEscapeKeyDown={(event) => saving && event.preventDefault()}>...</Tooltip.Content>
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onEscapeKeyDown?: ((event: KeyboardEvent) => void) | undefined;
  /**
   * Called when the user presses a pointer outside this tooltip, before it hides. Call `event.preventDefault()` to
   * keep it open.
   *
   * The press is `event.detail.originalEvent`.
   *
   * @example
   * <Tooltip.Content onPointerDownOutside={(event) => event.preventDefault()}>...</Tooltip.Content>
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onPointerDownOutside?: ((event: PointerDownOutsideEvent) => void) | undefined;
  /**
   * Whether the content stays in the document while the tooltip is closed, after hydration. The closed content has
   * `hidden` and `data-state="closed"`.
   *
   * Nothing renders on the server. Closed content has no dismiss layer and no position.
   *
   * @defaultValue false
   * @cckSemantic tooltip.content.forceMount
   * @cckParity Not available in every framework.
   */
  readonly forceMount?: boolean | undefined;
  /**
   * The side of the trigger that the content should sit on. `start` and `end` follow the text direction.
   *
   * The content flips to the other side when it does not fit, and `data-side` says where it is.
   *
   * @defaultValue 'top'
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
  readonly render?: RenderProp<TooltipRenderProps, TooltipContentState> | undefined;
}

/** Props of the {@link TooltipArrow}. Native `span` props pass through. */
export interface TooltipArrowProps extends Omit<ComponentPropsWithRef<'span'>, 'color'> {
  /**
   * Your own shape for the arrow. The arrow is decorative, so keep it free of text. When not set, the arrow is a
   * built-in triangle.
   *
   * @example
   * <Tooltip.Arrow>
   *   <svg width="10" height="5" viewBox="0 0 10 5" aria-hidden="true">
   *     <path d="M0 0 L5 5 L10 0" />
   *   </svg>
   * </Tooltip.Arrow>
   * @cckSemantic tooltip.default
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
  readonly render?: RenderProp<TooltipRenderProps, TooltipState> | undefined;
}

/** A Tooltip part: a function component with its `displayName`. */
export interface TooltipPart<P> {
  (props: P): ReactElement;
  displayName: string;
}
