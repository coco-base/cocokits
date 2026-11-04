import type { DismissIntent } from './dismiss-intent';
import type { DismissReason } from './dismiss-reason';
import { layerOf } from './layer';
import type { Layer } from './layer';
import { addLayer, exitLayer, removeLayer } from './layer-stack';

/** The causes a layer listens for unless `dismissOn` says otherwise. */
const DEFAULT_DISMISS_ON: readonly DismissReason[] = ['escape', 'outside-press'];

/** Options of {@link createDismissLayer}. */
export interface DismissLayerOptions {
  /** Elements that count as inside: the trigger and the content. Layers opened from this one count as inside automatically. */
  readonly getInsideElements: () => readonly (Element | null)[];
  /** Called for each intent; call `intent.preventDefault()` to refuse, otherwise close. The layer never closes anything itself. */
  readonly onDismiss: (intent: DismissIntent) => void;
  /** The causes this layer listens for. An outside press and a focus-out skip a layer that does not listen and go on below it; Escape considers only the topmost layer (as Radix DismissableLayer does), so a topmost layer that does not listen leaves Escape unhandled. @defaultValue ['escape', 'outside-press'] */
  readonly dismissOn?: readonly DismissReason[] | undefined;
  /** The layer this one opened from (a popover inside a dialog), read when the stack is used. A press inside this layer is inside the parent too, and this layer is always above the parent. */
  readonly getParent?: (() => DismissLayer | null) | undefined;
  /**
   * A native `<dialog>`: a barrier for the layers below it while it is modal; its `cancel` is routed through the stack
   * as `escape`. A dialog that is open but not modal (`show()`) is no barrier: it is a layer like a non-modal popover.
   */
  readonly getNativeDialog?: (() => HTMLDialogElement | null) | undefined;
  /** `true` makes a layer without a native dialog a barrier too (a popover whose outside is inert): an outside press or focus-out ends the walk here. @defaultValue false */
  readonly modal?: boolean | undefined;
}

/** A registered layer. */
export interface DismissLayer {
  /**
   * Stops intents at once. Containment, and a modal's barrier, stay until `destroy()`: call it when the overlay
   * starts to close, then `destroy()` when a modal has left the document. Idempotent.
   */
  exit(): void;
  /** Removes the layer from the stack. Idempotent. */
  destroy(): void;
}

/**
 * Registers an open overlay in the per-document layer stack and raises a cancelable {@link DismissIntent}
 * for each cause it listens for.
 *
 * - Escape goes to the topmost layer only, in the bubble phase, so an element inside that stops or prevents the
 *   keydown keeps every layer open. A handled Escape is default-prevented, so a dialog's native `cancel` does not
 *   follow. A keydown while composing is ignored. A `cancel` with no key before it is a close request and is
 *   raised as `escape`.
 * - An outside press or a focus-out walks the stack from the top down: a layer that contains the target ends the
 *   walk, a layer that does not listen is skipped, a modal ends the walk. The collected layers get their intents
 *   top-down and a refused intent stops the rest. A touch press is decided at `pointerdown` and dispatched on the
 *   `click` that follows; a press on a scrollbar never counts.
 *
 * Create it after the content is mounted: the document comes from the first element of `getInsideElements()` (or
 * the native dialog). With no element yet, nothing is registered. Inside and outside are decided from the
 * registered elements, never from DOM nesting.
 *
 * @param options - The inside elements, the callback and the causes.
 * @returns The layer; call `exit()` when the overlay starts to close and `destroy()` when it is gone.
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
