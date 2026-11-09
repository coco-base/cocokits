import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode, RefCallback } from 'react';
import type { DialogChangeReason } from '@cocokits/machines/dialog';
import type { CancelableChangeDetails } from '../internal/cancelable-change-details';
import type { FocusOutsideEvent, PointerDownOutsideEvent } from '../internal/dismiss-handlers';
import type { RenderProp } from '../internal/render-element';

export type { CancelableChangeDetails, DialogChangeReason, FocusOutsideEvent, PointerDownOutsideEvent };

/**
 * What `onOpenChange` receives besides the open state: the `reason`, the `event` behind the change, and `cancel()`
 * to refuse the change.
 */
export type DialogChangeDetails = CancelableChangeDetails<DialogChangeReason>;

/** The state of every Dialog part that the function form of `render` receives. */
export interface DialogState {
  /** Whether the dialog is open. */
  readonly open: boolean;
}

/**
 * The props that the function form of `render` receives: the native props merged with the props of the part. Pass
 * all of them, `ref` included, to one element.
 */
export interface DialogRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Any `data-*` attribute, such as `data-state` and the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The merged ref: the `ref` of the part, the `ref` of the rendered element and the `ref` of the part itself. */
  readonly ref: RefCallback<HTMLElement>;
}

/** Props of the {@link DialogRoot}. The Root renders no element. It gives the open state to its parts. */
export interface DialogRootProps {
  /**
   * The parts of the dialog: a `Dialog.Trigger` and a `Dialog.Content`. The Root renders no element around them.
   * When not set, nothing renders.
   *
   * @example
   * <Dialog.Root>
   *   <Dialog.Trigger>Delete project</Dialog.Trigger>
   *   <Dialog.Content>...</Dialog.Content>
   * </Dialog.Root>
   * @cckSemantic dialog.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Whether the dialog is open. Setting it makes the open state controlled. If you do not update it after
   * `onOpenChange`, the old state stays.
   *
   * @defaultValue false
   * @cckSemantic dialog.open
   */
  readonly open?: boolean | undefined;
  /**
   * The start open state of a dialog that you do not control with `open`. The content mounts after hydration, so
   * a dialog that starts open is closed on the server.
   *
   * @defaultValue false
   * @cckSemantic none
   * @cckParity The uncontrolled start value.
   */
  readonly defaultOpen?: boolean | undefined;
  /**
   * Called before the user opens or closes the dialog. It receives the new open state and a details object with
   * the `reason`, the `event` and `cancel()`.
   *
   * The user can do this with the trigger, a Close, a `<form method="dialog">`, Escape or a press on the backdrop.
   * Call `details.cancel()` to refuse the change. It is never called when you change `open` yourself.
   *
   * @example
   * <Dialog.Root
   *   onOpenChange={(open, details) => {
   *     if (!open && hasChanges) details.cancel();
   *   }}
   * >
   *   ...
   * </Dialog.Root>
   * @cckSemantic dialog.openChange
   * @cckParity The change callback of this component.
   */
  readonly onOpenChange?: ((open: boolean, details: DialogChangeDetails) => void) | undefined;
  /**
   * Whether the dialog is modal. A modal dialog has a backdrop, makes the rest of the page inert and stops the
   * page from scrolling.
   *
   * A dialog that is not modal opens as a native non-modal `dialog`. It has no backdrop and no `aria-modal`, and
   * the page stays usable. It closes on Escape, on a press outside and when the focus moves outside it.
   *
   * The trigger of a dialog that is not modal opens and closes it. After a press outside or a focus move, the focus
   * stays where the user put it. A change while the dialog is open applies at the next open.
   *
   * @defaultValue true
   * @cckSemantic dialog.modal
   * @cckParity Not available in every framework.
   */
  readonly modal?: boolean | undefined;
}

/** Props of the {@link DialogTrigger}. Native button props pass through. */
export interface DialogTriggerProps extends Omit<ComponentPropsWithRef<'button'>, 'color'> {
  /**
   * The label of the trigger, which is also its accessible name. When not set, the trigger has no name, so you
   * must give it an `aria-label`.
   *
   * @example
   * <Dialog.Trigger>Delete project</Dialog.Trigger>
   * @cckSemantic dialog.default
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
  readonly render?: RenderProp<DialogRenderProps, DialogState> | undefined;
}

/** Props of the {@link DialogContent}. Native `dialog` props pass through. */
export interface DialogContentProps extends Omit<ComponentPropsWithRef<'dialog'>, 'color'> {
  /**
   * The content of the dialog: a `Dialog.Title`, a `Dialog.Description`, the body and `Dialog.Close` buttons. When
   * not set, the dialog is empty.
   *
   * @example
   * <Dialog.Content>
   *   <Dialog.Title>Delete project</Dialog.Title>
   *   <Dialog.Description>You cannot undo this.</Dialog.Description>
   *   <Dialog.Close>Cancel</Dialog.Close>
   * </Dialog.Content>
   * @cckSemantic dialog.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Called when the user presses Escape while this dialog is on top, before it closes. Call
   * `event.preventDefault()` to keep it open.
   *
   * It is not called for a close request without a key, such as a back gesture. Refuse that one with
   * `details.cancel()` in `onOpenChange`. If you refuse Escape, give the user another way to close the dialog.
   *
   * @example
   * <Dialog.Content onEscapeKeyDown={(event) => saving && event.preventDefault()}>...</Dialog.Content>
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onEscapeKeyDown?: ((event: KeyboardEvent) => void) | undefined;
  /**
   * Called when the user presses a pointer outside this dialog, before it closes. Call `event.preventDefault()` to
   * keep it open.
   *
   * The press is `event.detail.originalEvent`.
   *
   * @example
   * <Dialog.Content onPointerDownOutside={(event) => event.preventDefault()}>...</Dialog.Content>
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onPointerDownOutside?: ((event: PointerDownOutsideEvent) => void) | undefined;
  /**
   * Called after `onPointerDownOutside`, with the same event, when the user presses outside this dialog. Call
   * `event.preventDefault()` to keep it open.
   *
   * @example
   * <Dialog.Content onInteractOutside={(event) => event.preventDefault()}>...</Dialog.Content>
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onInteractOutside?: ((event: PointerDownOutsideEvent | FocusOutsideEvent) => void) | undefined;
  /**
   * Whether the `dialog` stays in the document while the dialog is closed, after hydration. The closed `dialog` is
   * hidden, has `data-state="closed"` and keeps the state of its content.
   *
   * Nothing renders on the server. A closed dialog has no dismiss layer, no scroll lock and no focus move.
   *
   * @defaultValue false
   * @cckSemantic dialog.content.forceMount
   * @cckParity Not available in every framework.
   */
  readonly forceMount?: boolean | undefined;
  /**
   * Called when the dialog opens and the focus is about to move into it. Call `event.preventDefault()` to keep the
   * focus where the browser put it.
   *
   * The focus the browser moved stays. Move the focus in your handler to choose the element.
   *
   * @example
   * <Dialog.Content onOpenAutoFocus={(event) => { event.preventDefault(); nameInput.current?.focus(); }}>...</Dialog.Content>
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onOpenAutoFocus?: ((event: Event) => void) | undefined;
  /**
   * Called when the dialog closes and the focus is about to return to where the dialog opened from. Call
   * `event.preventDefault()` to skip the return and move the focus yourself.
   *
   * @example
   * <Dialog.Content onCloseAutoFocus={(event) => { event.preventDefault(); searchInput.current?.focus(); }}>...</Dialog.Content>
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly onCloseAutoFocus?: ((event: Event) => void) | undefined;
}

/** Props of the {@link DialogTitle}. Native `h2` props pass through. */
export interface DialogTitleProps extends Omit<ComponentPropsWithRef<'h2'>, 'color'> {
  /**
   * The text of the title, which names the dialog. When not set, the title is empty, so give the content an
   * `aria-label`.
   *
   * @example
   * <Dialog.Title>Delete project</Dialog.Title>
   * @cckSemantic dialog.default
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
  readonly render?: RenderProp<DialogRenderProps, DialogState> | undefined;
}

/** Props of the {@link DialogDescription}. Native `p` props pass through. */
export interface DialogDescriptionProps extends Omit<ComponentPropsWithRef<'p'>, 'color'> {
  /**
   * The text that describes the dialog. When not set, the description is empty.
   *
   * @example
   * <Dialog.Description>You cannot undo this.</Dialog.Description>
   * @cckSemantic dialog.default
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
  readonly render?: RenderProp<DialogRenderProps, DialogState> | undefined;
}

/** Props of the {@link DialogClose}. Native button props pass through. */
export interface DialogCloseProps extends Omit<ComponentPropsWithRef<'button'>, 'color'> {
  /**
   * The label of the Close button, which is also its accessible name. When not set, the button has no name, so you
   * must give it an `aria-label`.
   *
   * @example
   * <Dialog.Close>Cancel</Dialog.Close>
   * @cckSemantic dialog.default
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
  readonly render?: RenderProp<DialogRenderProps, DialogState> | undefined;
}

/** A Dialog part: a function component with its `displayName`. */
export interface DialogPart<P> {
  (props: P): ReactElement;
  displayName: string;
}
