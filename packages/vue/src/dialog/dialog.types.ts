import type { Component } from 'vue';
import type { AsTag, FocusOutsideEvent, PointerDownOutsideEvent } from '@cocokits/vue-core';
import type { DialogChangeReason } from '@cocokits/machines/dialog';

export type { DialogChangeReason };

/**
 * Groups a trigger and its content, and holds the open state. It renders no element: it provides the state to its
 * parts, so write the parts directly inside it. Bind the state with `v-model:open`.
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
   * Whether the dialog is open, bound with `v-model:open`. Bound with a listener it is controlled: a parent that
   * does not accept a change keeps the old value. Unbound, the dialog keeps its own value. A dialog that is open
   * on the server renders its content after hydration.
   *
   * @cckSemantic dialog.open
   * @cckParity Bound with `v-model:open`.
   * @defaultValue false
   */
  readonly open?: boolean | undefined;
  /**
   * The modifiers written on `v-model:open`; the component only declares them so they do not reach the DOM.
   *
   * @cckSemantic none
   * @cckParity Only this framework has this member.
   */
  readonly openModifiers?: Record<string, true> | undefined;
  /**
   * The initial open state of a dialog that is not bound, read once when it is created. Binding `open` ignores it.
   * The content mounts after hydration, so a dialog that is open by default renders closed on the server.
   *
   * @cckSemantic none
   * @cckParity The value the component starts with.
   * @defaultValue false
   */
  readonly defaultOpen?: boolean | undefined;
  /**
   * Whether the dialog is modal. A modal dialog is the native modal `dialog`: the page is inert and locked, and
   * focus stays inside. With `false` it opens non-modal (no backdrop, no `aria-modal`): the page stays usable,
   * focus may leave, and Escape, a press outside and focus moving outside close it. A press on the trigger toggles
   * it. Focus returns to the trigger on close, except after a press or focus outside. A change while the dialog is
   * open takes effect at the next open.
   *
   * @cckSemantic dialog.modal
   * @cckParity Not available in every framework.
   * @defaultValue true
   */
  readonly modal?: boolean | undefined;
  /**
   * Whether the content leaves the document when the dialog closes. With `false` it stays rendered, closed (a
   * `dialog` that is not open), as with `forceMount` on `DialogContent`.
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
   * Emits with the new open state for `v-model:open`, after every change the dialog accepts.
   *
   * @cckSemantic dialog.openChange
   * @remarks Carries no reason. A parent that bound `v-model:open` keeps its own value to refuse a change.
   * @cckParity The `update:open` event is the only change event; it carries no reason. A parent that bound `v-model:open` keeps its own value to refuse a change.
   */
  'update:open': [open: boolean];
}

/**
 * The `button` that opens the dialog. It gets `aria-expanded`, `aria-haspopup="dialog"` and, while the content is
 * mounted, `aria-controls`. Native button attributes and listeners fall through to it; a listener that calls
 * `preventDefault()` does not stop it from opening the dialog.
 *
 * @example
 * <DialogTrigger>Delete project</DialogTrigger>
 *
 * @cckPart trigger
 */
export interface DialogTriggerProps {
  /**
   * The tag or component to render, in place of the `button`. The part keeps its role, state, ids and handlers.
   * A tag or component other than `button` gets `role="button"`, `tabindex="0"` and no `type`; Enter activates it on
   * keydown and Space on keyup, and a key listener that calls `preventDefault()` keeps it as it is. Ignored with
   * `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'button'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the trigger merges onto its first element or component child (a `Button`) instead of rendering a
   * `button`. The child must render a `button`; its own props win except the ARIA and `data-state` markers.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The native `dialog`, opened with `showModal()` (or `show()` when the root is not `modal`). It renders in the overlay container (an open modal dialog
 * that holds the trigger, else the end of `<body>`), only while the dialog is open (and while its exit animation
 * runs). The rest of the page is inert, Tab moves through its controls and the browser decides what follows the
 * last one; focus starts where the browser puts it (an `autofocus` element, else the first focusable). It always
 * renders a `dialog`: the element is fixed, so it takes no `asChild`. Name it with a `DialogTitle`, or with
 * `aria-label`; a
 * development warning reminds you. Its `::backdrop` is the backdrop.
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
   * Whether the content stays in the document while the dialog is closed, so its children and their state are
   * kept. The `dialog` is not open then, so the browser hides it. It renders after hydration: the server renders
   * no content.
   *
   * @cckSemantic dialog.content.forceMount
   * @cckParity Not available in every framework.
   * @defaultValue false
   */
  readonly forceMount?: boolean | undefined;
}

/**
 * The events of the DialogContent. Each of the first four is cancelable: a listener that calls `preventDefault()`
 * on its event (or is written with `.prevent`) refuses the dismissal and the dialog stays open. Refusing Escape
 * or the backdrop weakens the dialog pattern, because users expect them to close it; give another way out, and
 * keep the refusal short-lived (the form is dirty, a save is running). Focus never leaves a modal dialog; a
 * non-modal one emits `focusOutside` and `pointerDownOutside` for a press or focus anywhere outside it. A close request that carries no key (an Android back gesture, assistive technology)
 * reaches no listener; keep `open` as it is in `v-model:open` to refuse it.
 *
 * @example
 * <DialogContent @escape-key-down.prevent>…</DialogContent>
 */
export interface DialogContentEmits {
  /**
   * Emits before Escape closes the dialog, with the keydown. Call `preventDefault()` to keep it open.
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  escapeKeyDown: [event: KeyboardEvent];
  /**
   * Emits before a press on the backdrop closes the dialog, with a cancelable event whose `detail.originalEvent`
   * is the press. Call `preventDefault()` to keep it open.
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  pointerDownOutside: [event: PointerDownOutsideEvent];
  /**
   * Emits before focus moving outside closes a non-modal dialog (`modal` off), with a cancelable event whose
   * `detail.originalEvent` is the focus event. Call `preventDefault()` to keep it open. A modal dialog never emits it.
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  focusOutside: [event: FocusOutsideEvent];
  /**
   * Emits after `pointerDownOutside` or `focusOutside`, with the same event, before the dialog closes. Call
   * `preventDefault()` to keep it open.
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  interactOutside: [event: PointerDownOutsideEvent | FocusOutsideEvent];
  /**
   * Emits right after the dialog is shown, when the browser has moved focus into it already. Preventing it
   * keeps CocoKits from moving focus anywhere else; the focusing the browser did stays. Move focus in your
   * listener to choose the element.
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  openAutoFocus: [event: Event];
  /**
   * Emits before focus returns to the element that had it when the dialog opened (the trigger, or the opener of a
   * dialog without a trigger). Call `preventDefault()` to skip the return and move focus yourself.
   *
   * @cckSemantic none
   * @cckParity The Content part emits it.
   */
  closeAutoFocus: [event: Event];
}

/**
 * The heading that names the dialog; the content refers to it with `aria-labelledby` while it is mounted. It
 * renders an `h2`; use `asChild` with another heading level.
 *
 * @example
 * <DialogTitle>Delete project</DialogTitle>
 *
 * @cckPart title
 */
export interface DialogTitleProps {
  /**
   * The tag or component to render, in place of the `h2`. The part keeps its role, state, ids and handlers. Ignored
   * with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'h2'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the title merges onto its first element child (a heading you choose) instead of rendering an `h2`.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * The text that describes the dialog; the content refers to it with `aria-describedby` while it is mounted.
 *
 * @example
 * <DialogDescription>This cannot be undone.</DialogDescription>
 *
 * @cckPart description
 */
export interface DialogDescriptionProps {
  /**
   * The tag or component to render, in place of the `p`. The part keeps its role, state, ids and handlers. Ignored
   * with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'p'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the description merges onto its first element child instead of rendering a `p`.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}

/**
 * A `button` that closes the dialog. Native button attributes and listeners fall through to it; a listener that
 * calls `preventDefault()` does not stop it from closing the dialog.
 *
 * @example
 * <DialogClose>Cancel</DialogClose>
 *
 * @cckPart close
 */
export interface DialogCloseProps {
  /**
   * The tag or component to render, in place of the `button`. The part keeps its role, state, ids and handlers.
   * A tag or component other than `button` gets `role="button"`, `tabindex="0"` and no `type`; Enter activates it on
   * keydown and Space on keyup, and a key listener that calls `preventDefault()` keeps it as it is. Ignored with
   * `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'button'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the Close merges onto its first element or component child (a `Button`) instead of rendering a
   * `button`. The child must render a `button`.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
