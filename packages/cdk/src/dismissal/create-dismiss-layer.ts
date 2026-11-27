import type { DismissIntent } from './dismiss-intent';
import type { DismissReason } from './dismiss-reason';
import { layerOf } from './layer';
import type { Layer } from './layer';
import { addLayer, exitLayer, removeLayer } from './layer-stack';

/** The causes a layer listens for unless `dismissOn` says otherwise. */
const DEFAULT_DISMISS_ON: readonly DismissReason[] = ['escape', 'outside-press'];

/** Options of {@link createDismissLayer}. */
export interface DismissLayerOptions {
  /**
   * Returns the elements that count as inside the layer, which are usually the trigger and the content.
   * Layers opened from this one count as inside automatically.
   *
   * The layer needs at least one element to find its document. With none, the layer is inert: it registers nothing and raises no intent.
   */
  readonly getInsideElements: () => readonly (Element | null)[];
  /** Called for each request to close. Call `intent.preventDefault()` to refuse it, or close the overlay. The layer never closes anything itself. */
  readonly onDismiss: (intent: DismissIntent) => void;
  /**
   * The causes this layer listens for.
   * An outside press and a focus-out skip a layer that does not listen and go on to the layer below it.
   *
   * Escape goes only to the topmost layer. When that layer does not listen for Escape, Escape is not handled.
   * @defaultValue ['escape', 'outside-press']
   */
  readonly dismissOn?: readonly DismissReason[] | undefined;
  /**
   * Returns the layer that this one opened from, such as a popup inside a dialog. It is read when the stack is used.
   * A press inside this layer is also inside the parent, and this layer is always above the parent.
   *
   * When not set, the layer has no parent.
   */
  readonly getParent?: (() => DismissLayer | null) | undefined;
  /**
   * Returns the native `<dialog>` of the layer. While the dialog is modal it is a barrier for the layers below it, and its `cancel` event is raised as `escape`.
   *
   * A dialog that is open but not modal, opened with `show()`, is no barrier. It is a layer like a popup.
   *
   * When not set, the layer has no native dialog.
   */
  readonly getNativeDialog?: (() => HTMLDialogElement | null) | undefined;
  /**
   * Whether a layer without a native dialog is a barrier too, such as a popup whose outside is inert.
   * An outside press or a focus-out then ends the walk at this layer.
   * @defaultValue false
   */
  readonly modal?: boolean | undefined;
}

/** A registered layer. */
export interface DismissLayer {
  /**
   * Stops requests to close at once. Call it when the overlay starts to close.
   * The layer still counts as inside, and a modal layer stays a barrier, until you call `destroy()`.
   *
   * Calling it again does nothing.
   */
  exit(): void;
  /** Removes the layer from the stack. Call it when a modal has left the document. Calling it again does nothing. */
  destroy(): void;
}

/**
 * Registers an open overlay and asks you to close it when the user presses Escape, presses outside it, or moves
 * focus out of it. Each request is a {@link DismissIntent} that you can refuse.
 *
 * @remarks
 * Open overlays form one stack for each document. The layer never closes anything. You decide in `onDismiss`.
 *
 * **Escape.** It goes to the topmost layer only, in the bubble phase. An element inside that stops or prevents the
 * keydown keeps every layer open. A handled Escape is default-prevented, so a dialog's native `cancel` does not follow.
 * A keydown while composing text is ignored. A `cancel` with no key before it is a close request, and it is raised as `escape`.
 *
 * **Outside press and focus-out.** They walk the stack from the top down. A layer that contains the target ends the walk.
 * A layer that does not listen for the cause is skipped. A modal layer ends the walk. The collected layers get their
 * intents from the top down, and a refused intent stops the rest. A touch press is decided at `pointerdown` and raised
 * on the `click` that follows. A press on a scrollbar never counts.
 *
 * Create the layer after the content is in the document. The document comes from the first element of
 * `getInsideElements()`, or from the native dialog. With no element, the layer is inert: nothing is registered and no
 * request is raised. Inside and outside come from the elements you return, never from DOM nesting.
 *
 * @param options - The inside elements, the callback and the causes.
 * @returns The layer. Call `exit()` when the overlay starts to close and `destroy()` when it is gone.
 * @example
 * const panel = document.querySelector<HTMLElement>('#panel')!;
 * const layer = createDismissLayer({
 *   getInsideElements: () => [panel],
 *   onDismiss: (intent) => {
 *     if (intent.reason === 'escape') panel.hidden = true;
 *   },
 * });
 * // When the panel is gone:
 * layer.destroy();
 */
export function createDismissLayer(options: DismissLayerOptions): DismissLayer {
  const doc = [...options.getInsideElements(), options.getNativeDialog?.() ?? null].find(Boolean)?.ownerDocument;
  if (!doc) return { exit: () => undefined, destroy: () => undefined };
  const layer: Layer = {
    getInside: options.getInsideElements,
    getDialog: options.getNativeDialog,
    onDismiss: options.onDismiss,
    dismissOn: new Set(options.dismissOn ?? DEFAULT_DISMISS_ON),
    getParent: options.getParent,
    modal: options.modal ?? false,
    exited: false,
    destroyed: false,
  };
  addLayer(doc, layer);
  const handle: DismissLayer = {
    exit() {
      if (!layer.exited && !layer.destroyed) exitLayer(doc, layer);
    },
    destroy() {
      if (!layer.destroyed) removeLayer(doc, layer);
    },
  };
  layerOf.set(handle, layer);
  return handle;
}
