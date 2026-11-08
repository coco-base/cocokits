import type { Component } from 'vue';
import type { AsTag, FocusOutsideEvent, PointerDownOutsideEvent } from '@cocokits/vue-core';
import type { DialogChangeReason } from '@cocokits/machines/dialog';

export type { DialogChangeReason };

/**
 * Groups a trigger and its content, and holds the open state. It renders no element, so write the parts directly
 * inside it. Bind the state with `v-model:open`.
 *
 * @example
 * <DialogRoot v-model:open="open">
 *   <DialogTrigger>Delete project</DialogTrigger>
 *   <DialogContent>
 *     <DialogTitle>Delete project</DialogTitle>
 *     <DialogDescription>This cannot be undone.</DialogDescription>
 *     <DialogClose>Cancel</DialogClose>
 *   </DialogContent>
 * </DialogRoot>
 *
 * @cckPart root
 */
export interface DialogRootProps {
  /**
   * Whether the dialog is open, bound with `v-model:open`. When not set, the dialog keeps its own state, which
   * starts as `defaultOpen`.
   *
   * If you listen for changes and do not accept one, the old value stays. A dialog that is open on the server
   * renders its content after hydration.
   *
   * @cckSemantic dialog.open
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
   * The start open state of a dialog whose `open` is not bound. It is read once, when the dialog is created. A
   * bound `open` ignores it.
   *
   * The content mounts after hydration, so a dialog that starts open renders closed on the server.
   *
   * @cckSemantic none
   * @cckParity The value the component starts with.
   * @defaultValue false
   */
  readonly defaultOpen?: boolean | undefined;
  /**
   * Whether the dialog is modal. A modal dialog is the native modal `<dialog>`: the page is inert and locked, and
   * the focus stays inside.
   *
   * With `false`, the dialog has no backdrop and no `aria-modal`. The page stays usable, and the focus can leave.
   * Escape, a press outside and the focus moving outside close it, and a press on the trigger toggles it.
   *
   * The focus returns to the trigger on close, except after a press or focus outside. A change while the dialog is
   * open takes effect at the next open.
   *
   * @cckSemantic dialog.modal
   * @cckParity Not available in every framework.
   * @defaultValue true
   */
  readonly modal?: boolean | undefined;
  /**
   * Whether the content leaves the document when the dialog closes. With `false`, it stays rendered as a closed
   * `<dialog>`, as with `forceMount` on `DialogContent`.
   *
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   * @defaultValue true
   */
  readonly unmountOnHide?: boolean | undefined;
}

/** The events of the DialogRoot. */
export interface DialogRootEmits {
  /**
   * Emits the new open state for `v-model:open` after every change the dialog accepts. It carries no reason.
   *
   * To refuse a change, a parent that bound `v-model:open` keeps its own value.
   *
   * @cckSemantic dialog.openChange
   * @cckParity The `update:open` event is the only change event; it carries no reason. A parent that bound `v-model:open` keeps its own value to refuse a change.
   */
  'update:open': [open: boolean];
}

/**
 * The `<button>` that opens the dialog. It gets `aria-expanded` and `aria-haspopup="dialog"`, and `aria-controls`
 * while the content is mounted.
 *
 * Native button attributes and listeners fall through to it. A listener that calls `preventDefault()` does not stop
 * it from opening the dialog.
 *
 * With `as`, a tag or component other than `button` gets `role="button"`, `tabindex="0"` and no `type`. Enter
 * activates it on keydown and Space on keyup. A key listener that calls `preventDefault()` stops that. With
 * `asChild`, the child must render a `<button>`. Its own props win, except the ARIA and `data-state` markers.
 *
 * @example
 * <DialogTrigger>Delete project</DialogTrigger>
 *
 * @cckPart trigger
 */
export interface DialogTriggerProps {
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
 * The native `<dialog>`, opened with `showModal()`, or with `show()` when the root is not `modal`. It renders in the
 * overlay container, not next to the trigger. It renders only while the dialog is open and while its exit animation
 * runs.
 *
 * The overlay container is an open modal dialog that holds the trigger, or else the end of `<body>`.
 *
 * The rest of the page is inert. Tab moves through the controls of the dialog, and the browser decides what follows
 * the last one. The focus starts where the browser puts it: an `autofocus` element, or else the first focusable one.
 *
 * It always renders a `<dialog>`, so it takes no `as` and no `asChild`. Name it with a `DialogTitle` or with
 * `aria-label`; a development warning reminds you. Its `::backdrop` is the backdrop.
 *
 * Call `preventDefault()` in a listener of `escapeKeyDown`, `pointerDownOutside`, `focusOutside` or
 * `interactOutside` to keep the dialog open, or write the listener with `.prevent`. Users expect Escape and the
 * backdrop to close a dialog. So give another way out, and refuse only for a short time, such as while a save runs.
 *
 * A close request that carries no key, such as a back gesture or assistive technology, reaches no listener. To
 * refuse it, keep `open` as it is in `v-model:open`.
 *
 * @example
 * <DialogContent>
 *   <DialogTitle>Delete project</DialogTitle>
 *   <DialogClose>Cancel</DialogClose>
 * </DialogContent>
 *
 * @cckPart content
 */
export interface DialogContentProps {
  /**
   * Whether the content stays in the document while the dialog is closed, so its children keep their state. The
   * `<dialog>` is not open then, so the browser hides it.
   *
   * It renders after hydration, so the server renders no content.
   *
   * @cckSemantic dialog.content.forceMount
   * @cckParity Not available in every framework.
   * @defaultValue false
   */
  readonly forceMount?: boolean | undefined;
}

/** The events of the DialogContent. */
export interface DialogContentEmits {
  /**
   * Emits before Escape closes the dialog, with the keydown event. Call `preventDefault()` to keep the dialog open.
   *
   * @example
   * <DialogContent @escape-key-down="(event) => saving && event.preventDefault()">...</DialogContent>
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  escapeKeyDown: [event: KeyboardEvent];
  /**
   * Emits before a press outside the dialog closes it. The `detail.originalEvent` of the event is the press. Call
   * `preventDefault()` to keep the dialog open.
   *
   * A modal dialog emits it for a press on the backdrop. A non-modal dialog emits it for a press anywhere outside.
   *
   * @example
   * <DialogContent @pointer-down-outside="(event) => event.preventDefault()">...</DialogContent>
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  pointerDownOutside: [event: PointerDownOutsideEvent];
  /**
   * Emits before the focus moving outside closes a dialog that is not `modal`. The `detail.originalEvent` of the
   * event is the focus event. Call `preventDefault()` to keep the dialog open.
   *
   * A modal dialog never emits it, because the focus never leaves it.
   *
   * @example
   * <DialogContent @focus-outside="(event) => event.preventDefault()">...</DialogContent>
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  focusOutside: [event: FocusOutsideEvent];
  /**
   * Emits after `pointerDownOutside` or `focusOutside`, with the same event, before the dialog closes. Call
   * `preventDefault()` to keep the dialog open.
   *
   * @example
   * <DialogContent @interact-outside="(event) => dirty && event.preventDefault()">...</DialogContent>
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  interactOutside: [event: PointerDownOutsideEvent | FocusOutsideEvent];
  /**
   * Emits right after the dialog is shown, when the browser has moved the focus into it. Call `preventDefault()` to
   * keep the component from moving the focus again.
   *
   * The focus the browser moved stays. Move the focus in your listener to choose the element.
   *
   * @example
   * <DialogContent @open-auto-focus="(event) => { event.preventDefault(); nameInput?.focus(); }">...</DialogContent>
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  openAutoFocus: [event: Event];
  /**
   * Emits before the focus returns to the element that had it when the dialog opened. That is the trigger, or the
   * opener of a dialog without a trigger. Call `preventDefault()` to skip the return and move the focus yourself.
   *
   * @example
   * <DialogContent @close-auto-focus="(event) => { event.preventDefault(); searchInput?.focus(); }">...</DialogContent>
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  closeAutoFocus: [event: Event];
}

/**
 * The heading that names the dialog. It renders an `<h2>`. Use `as` or `asChild` for another heading level.
 *
 * The content refers to it with `aria-labelledby` while it is mounted.
 *
 * @example
 * <DialogTitle>Delete project</DialogTitle>
 *
 * @cckPart title
 */
export interface DialogTitleProps {
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
 * The text that describes the dialog. It renders a `<p>`. The content refers to it with `aria-describedby` while it
 * is mounted.
 *
 * @example
 * <DialogDescription>This cannot be undone.</DialogDescription>
 *
 * @cckPart description
 */
export interface DialogDescriptionProps {
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
 * A `<button>` that closes the dialog. Native button attributes and listeners fall through to it. A listener that
 * calls `preventDefault()` does not stop it from closing the dialog.
 *
 * With `as`, a tag or component other than `button` gets `role="button"`, `tabindex="0"` and no `type`. Enter
 * activates it on keydown and Space on keyup. A key listener that calls `preventDefault()` stops that. With
 * `asChild`, the child must render a `<button>`.
 *
 * @example
 * <DialogClose>Cancel</DialogClose>
 *
 * @cckPart close
 */
export interface DialogCloseProps {
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
