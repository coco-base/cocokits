import type { ComponentPropsWithRef, HTMLAttributes, ReactElement, ReactNode, RefCallback } from 'react';
import type { DialogChangeReason, DialogLength, DialogRole } from '@cocokits/machines/dialog';
import type { CancelableChangeDetails } from '../internal/cancelable-change-details';
import type { FocusOutsideEvent, PointerDownOutsideEvent } from '../internal/dismiss-handlers';
import type { RenderProp } from '../internal/render-element';

export type {
  CancelableChangeDetails,
  DialogChangeReason,
  DialogLength,
  DialogRole,
  FocusOutsideEvent,
  PointerDownOutsideEvent,
};

/**
 * What `closePredicate` receives: why the dialog would close and the event behind it.
 */
export interface DialogClosePredicateDetails {
  /** Why the dialog would close. */
  readonly reason: DialogChangeReason;
  /** The event behind the close; `null` when none. */
  readonly event: Event | null;
}

/**
 * Which element gets the focus when a dialog opens. Any other string is a selector, and the first element that
 * matches it gets the focus.
 *
 * @cckValue first-tabbable - The first element with `autofocus`, or else the first element that Tab reaches, or else the dialog.
 * @cckValue dialog - The dialog itself.
 * @cckValue first-heading - The first heading in the dialog.
 * @cckValue true - The same as `'first-tabbable'`.
 * @cckValue false - The same as `'dialog'`.
 */
export type DialogAutoFocus = 'dialog' | 'first-tabbable' | 'first-heading' | (string & {}) | boolean;

/**
 * Where the focus goes when a dialog closes. A string is a selector, and an element gets the focus itself.
 *
 * @cckValue true - The element that had the focus when the dialog opened, or the trigger.
 * @cckValue false - The focus does not move.
 */
export type DialogRestoreFocus = boolean | string | HTMLElement;

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
  /**
   * Whether Escape and a press on the backdrop leave the dialog open. The Close part, a `<form method="dialog">`
   * and the trigger still change the open state.
   *
   * Without Escape, a keyboard user can leave only with the controls inside the dialog. Keep a `Dialog.Close`.
   *
   * @defaultValue false
   * @cckSemantic dialog.disableClose
   * @cckParity Not available in every framework.
   */
  readonly disableClose?: boolean | undefined;
  /**
   * A function that decides whether a close happens. Return `false` to keep the dialog open. When not set, every
   * close happens.
   *
   * It runs once for each close the user asks for: Escape, the backdrop, a Close part and a
   * `<form method="dialog">`. It never runs for a close on navigation, and not for a close that
   * `disableClose` has already refused.
   *
   * @example
   * <Dialog.Root closePredicate={({ reason }) => reason !== 'outside-press'}>...</Dialog.Root>
   * @cckSemantic dialog.closePredicate
   * @cckParity Not available in every framework.
   */
  readonly closePredicate?: ((details: DialogClosePredicateDetails) => boolean) | undefined;
  /**
   * Whether the dialog closes when the user goes back or forward in the history, or the hash changes. A close on
   * navigation skips `disableClose` and `closePredicate`, and reports the reason `close`.
   *
   * @defaultValue true
   * @cckSemantic dialog.closeOnNavigation
   * @cckParity Not available in every framework.
   */
  readonly closeOnNavigation?: boolean | undefined;
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
export interface DialogContentProps extends Omit<ComponentPropsWithRef<'dialog'>, 'color' | 'autoFocus' | 'role'> {
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
   * `details.cancel()` in `onOpenChange`. A Close part still closes it. So does a press on the backdrop of a modal
   * dialog. The trigger closes a dialog that is not modal. Keep one of them.
   *
   * @example
   * const [saving, setSaving] = useState(false);
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
   * Move the focus in your handler to choose the element.
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
  /**
   * The role of the dialog. A native `<dialog>` has the role `dialog`, so only `'alertdialog'` is written. Use
   * `'alertdialog'` for a message that needs an answer at once, and give it a `Dialog.Description`.
   *
   * @defaultValue 'dialog'
   * @cckSemantic dialog.role
   * @cckParity Not available in every framework.
   */
  readonly role?: DialogRole | undefined;
  /**
   * Which element gets the focus when the dialog opens. A selector string focuses the first element that matches
   * it. `onOpenAutoFocus` can still keep the focus where it is.
   *
   * @defaultValue 'first-tabbable'
   * @cckSemantic dialog.autoFocus
   * @cckParity Not available in every framework.
   */
  readonly autoFocus?: DialogAutoFocus | undefined;
  /**
   * Where the focus goes when the dialog closes. A string is a selector, and an element gets the focus itself.
   * `onCloseAutoFocus` can still skip the move.
   *
   * @defaultValue true
   * @cckSemantic dialog.restoreFocus
   * @cckParity Not available in every framework.
   */
  readonly restoreFocus?: DialogRestoreFocus | undefined;
  /**
   * The width of the content. A number is px, a string is any CSS length such as `'40rem'` or `'90vw'`. The size
   * members are the one inline style a part writes; they belong to the author, not to a theme.
   *
   * @cckSemantic dialog.width
   * @cckParity Not available in every framework.
   */
  readonly width?: DialogLength | undefined;
  /**
   * The height of the content. A number is px, a string is any CSS length.
   *
   * @cckSemantic dialog.height
   * @cckParity Not available in every framework.
   */
  readonly height?: DialogLength | undefined;
  /**
   * The smallest width of the content. A number is px, a string is any CSS length.
   *
   * @cckSemantic dialog.minWidth
   * @cckParity Not available in every framework.
   */
  readonly minWidth?: DialogLength | undefined;
  /**
   * The smallest height of the content. A number is px, a string is any CSS length.
   *
   * @cckSemantic dialog.minHeight
   * @cckParity Not available in every framework.
   */
  readonly minHeight?: DialogLength | undefined;
  /**
   * The largest width of the content. A number is px, a string is any CSS length.
   *
   * @cckSemantic dialog.maxWidth
   * @cckParity Not available in every framework.
   */
  readonly maxWidth?: DialogLength | undefined;
  /**
   * The largest height of the content. A number is px, a string is any CSS length.
   *
   * @cckSemantic dialog.maxHeight
   * @cckParity Not available in every framework.
   */
  readonly maxHeight?: DialogLength | undefined;
}

/** Props of the {@link DialogHeader}, the {@link DialogBody} and the {@link DialogFooter}. Native `div` props pass through. */
export interface DialogSectionProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /**
   * The content of the section.
   *
   * @example
   * <Dialog.Header>
   *   <Dialog.Title>Delete project</Dialog.Title>
   *   <Dialog.Close aria-label="Close">x</Dialog.Close>
   * </Dialog.Header>
   * @cckSemantic dialog.default
   */
  readonly children?: ReactNode | undefined;
  /**
   * Replaces the element that the part renders. Pass an element, or a function of the merged props and the state
   * of the part. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the part renders a `<div>` with no role.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<DialogRenderProps, DialogState> | undefined;
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
