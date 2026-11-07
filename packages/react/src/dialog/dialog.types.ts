import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode, RefCallback } from 'react';
import type { DialogChangeReason } from '@cocokits/machines/dialog';
import type { CancelableChangeDetails } from '../internal/cancelable-change-details';
import type { FocusOutsideEvent, PointerDownOutsideEvent } from '../internal/dismiss-handlers';

export type { CancelableChangeDetails, DialogChangeReason, FocusOutsideEvent, PointerDownOutsideEvent };

/**
 * What `onOpenChange` receives besides the open state: the reason, the event behind it, and `cancel()` to refuse
 * the change.
 */
export type DialogChangeDetails = CancelableChangeDetails<DialogChangeReason>;

/** The public state of every Dialog part, passed to the function form of `render`. */
export interface DialogState {
  /** Whether the dialog is open. */
  readonly open: boolean;
}

/**
 * The props the function form of `render` receives: the native props merged with the part's own. Spread all of
 * them, including `ref`, onto one element.
 */
export interface DialogRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Any `data-*` attribute, such as `data-state` and the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The merged ref: the part's `ref`, the rendered element's own `ref` and the part's internal one. */
  readonly ref: RefCallback<HTMLElement>;
}

/** Props of the {@link DialogRoot}. The root renders no element: it provides the open state to its parts. */
export interface DialogRootProps {
  /**
   * The parts of the dialog: a trigger and the content. The root renders no element around them.
   *
   * @cckSemantic dialog.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * The open state, which makes the dialog controlled. A parent that does not update it after `onOpenChange`
   * keeps the old state.
   *
   * @defaultValue false
   * @cckSemantic dialog.open
   */
  readonly open?: boolean | undefined;
  /**
   * The initial open state of an uncontrolled dialog. The content mounts after hydration, so a dialog that is
   * open by default renders closed on the server.
   *
   * @defaultValue false
   * @cckSemantic none
   * @cckParity The uncontrolled start value.
   */
  readonly defaultOpen?: boolean | undefined;
  /**
   * Called for every change the user makes, before it applies: the trigger, Close or a `<form method="dialog">`,
   * Escape, or a press on the backdrop. Never when the parent sets `open`. Call `details.cancel()` to refuse the
   * change: an uncontrolled dialog keeps its state, and a refused Escape or backdrop press counts as refused.
   *
   * @cckSemantic dialog.openChange
   * @cckParity The change callback of this component.
   */
  readonly onOpenChange?: ((open: boolean, details: DialogChangeDetails) => void) | undefined;
  /**
   * Whether the dialog is modal. A dialog that is not modal opens as a native non-modal `dialog`: no backdrop, the
   * page stays usable and scrollable, Tab is not contained and there is no `aria-modal`. It closes on Escape, on a
   * press outside and when focus moves to an element outside it (each refusable); a press on the trigger toggles it
   * and is not outside; the layers below still get an outside press. Focus returns to the trigger on close, except
   * after an outside press or focus-out, when it stays where the user put it. Switching it while the dialog is
   * open takes effect at the next open.
   *
   * @defaultValue true
   * @cckSemantic dialog.modal
   * @cckParity Not available in every framework.
   */
  readonly modal?: boolean | undefined;
}

/**
 * The `render` prop of a part: an element, or a function of the merged props and the part's state. The function
 * form does not work from a Server Component.
 */
type RenderProp = ReactElement | ((props: DialogRenderProps, state: DialogState) => ReactElement);

/** Props of the {@link DialogTrigger}. Native button props pass through. */
export interface DialogTriggerProps extends Omit<ComponentPropsWithRef<'button'>, 'color'> {
  /**
   * The trigger label, rendered inside the button as written.
   *
   * @cckSemantic dialog.default
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
   * the {@link DialogState}. The function form
   * must spread all the props it receives, including `ref`, onto one element. An element that is not a `<button>` also needs `nativeButton={false}`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp | undefined;
}

/** Props of the {@link DialogContent}. Native `dialog` props pass through. */
export interface DialogContentProps extends Omit<ComponentPropsWithRef<'dialog'>, 'color'> {
  /**
   * The content of the dialog: a `Dialog.Title`, a `Dialog.Description`, the body and `Dialog.Close` buttons.
   *
   * @cckSemantic dialog.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Called when Escape is pressed with this dialog on top, before it closes. Call `event.preventDefault()` to keep
   * it open. It is not called for a close request without a key (a back gesture, assistive technology): refuse
   * that one with `details.cancel()` in `onOpenChange`. Refusing Escape or the outside press weakens the dialog
   * pattern: keep another way to close it.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onEscapeKeyDown?: ((event: KeyboardEvent) => void) | undefined;
  /**
   * Called when a pointer press lands outside this dialog, before it closes. The press is
   * `event.detail.originalEvent`. Call `event.preventDefault()` to keep it open.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onPointerDownOutside?: ((event: PointerDownOutsideEvent) => void) | undefined;
  /**
   * Called after `onPointerDownOutside`, with the same event, when a press lands outside this dialog.
   * Call `event.preventDefault()` to keep it open.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onInteractOutside?: ((event: PointerDownOutsideEvent | FocusOutsideEvent) => void) | undefined;
  /**
   * Keeps the `dialog` in the document while the dialog is closed, after hydration: it is then not open (the user
   * agent hides it), has `data-state="closed"`, and the state inside it is kept across open and close. Nothing is
   * rendered on the server. Closed, it has no dismiss layer, no scroll lock and no focus move.
   *
   * @defaultValue false
   * @cckSemantic dialog.content.forceMount
   * @cckParity Not available in every framework.
   */
  readonly forceMount?: boolean | undefined;
  /**
   * Called when the dialog opens and focus is about to move into it. Call `event.preventDefault()` to stop
   * CocoKits from moving focus (a dialog's native focusing has already run when this is called).
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onOpenAutoFocus?: ((event: Event) => void) | undefined;
  /**
   * Called when the dialog closes and focus is about to return to where it opened from. Call
   * `event.preventDefault()` to skip the return.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onCloseAutoFocus?: ((event: Event) => void) | undefined;
}

/** Props of the {@link DialogTitle}. Native `h2` props pass through. */
export interface DialogTitleProps extends Omit<ComponentPropsWithRef<'h2'>, 'color'> {
  /**
   * The title text.
   *
   * @cckSemantic dialog.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Replaces the rendered `<h2>` with the heading you choose, such as `<h3 />`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp | undefined;
}

/** Props of the {@link DialogDescription}. Native `p` props pass through. */
export interface DialogDescriptionProps extends Omit<ComponentPropsWithRef<'p'>, 'color'> {
  /**
   * The description text.
   *
   * @cckSemantic dialog.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Replaces the rendered `<p>`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp | undefined;
}

/** Props of the {@link DialogClose}. Native button props pass through. */
export interface DialogCloseProps extends Omit<ComponentPropsWithRef<'button'>, 'color'> {
  /**
   * The label of the Close button. An icon-only Close needs `aria-label`.
   *
   * @cckSemantic dialog.default
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
   * the {@link DialogState}. The function form must spread all the props it receives, including `ref`, onto one
   * element. An element that is not a `<button>` also needs `nativeButton={false}`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp | undefined;
}

/** A Dialog part: a function component with its `displayName`. */
export interface DialogPart<P> {
  (props: P): ReactElement;
  displayName: string;
}
