import type { CckOverlayLayer } from '@cocokits/angular-core';
import type { DismissLayer } from '@cocokits/cdk/dismissal';
import { scheduleFocus, type FocusReturn } from '@cocokits/cdk/focus';
import { lockScroll } from '@cocokits/cdk/scroll-lock';

/** What {@link DialogModal} needs from its Dialog root. @internal */
export interface DialogModalOptions {
  /** The overlay layer of the root; `current` is the dismiss layer while there is one. */
  readonly layer: CckOverlayLayer;
  /** Creates the dismiss layer of this open period. */
  readonly createLayer: () => DismissLayer;
  /** Whether the Dialog is open now. */
  readonly isOpen: () => boolean;
  /** Called once focus went back, or when there was no focus to return. */
  readonly returned: () => void;
}

/**
 * What an open Dialog holds until the closed modal has left the document: the dismiss layer (Escape, a press on the
 * backdrop), the scroll lock and the focus return. When the Dialog closes the layer only exits: it raises no intent,
 * but stays a barrier until {@link release}.
 *
 * @internal
 */
export class DialogModal {
  private dismissLayer: DismissLayer | null = null;
  /** The layer has exited: it raises no intent, but stays a barrier until the modal has left the document. */
  private exited = false;
  /** The scroll lock, held until the closed modal has left the document. */
  private unlock: (() => void) | null = null;
  /** Focus goes back once the closed dialog has left the document (it is inert until then). */
  private pendingReturn: { readonly doc: Document; readonly focusReturn: FocusReturn } | null = null;
  private returnScheduled = false;

  constructor(private readonly options: DialogModalOptions) {}

  /** Registers the dismiss layer if it is not registered yet, or registers a new one after an exit. */
  startLayer(): void {
    if (this.dismissLayer && !this.exited) return;
    this.stopLayer();
    const layer = this.options.createLayer();
    this.dismissLayer = layer;
    this.options.layer.current = layer;
  }

  /** Stops the layer's intents; it stays registered as a barrier until {@link release}. */
  exitLayer(): void {
    this.dismissLayer?.exit();
    this.exited = true;
  }

  /**
   * Stops the page from scrolling, once per open period.
   *
   * @param doc - The document of the trigger or opener.
   */
  lock(doc: Document): void {
    this.unlock ??= lockScroll(doc);
  }

  /**
   * Keeps where focus goes back to until {@link flushReturn}.
   *
   * @param doc - The document of the trigger or opener.
   * @param focusReturn - The captured return, or `null` when focus stays where it is.
   */
  queueReturn(doc: Document, focusReturn: FocusReturn | null): void {
    if (focusReturn) this.pendingReturn = { doc, focusReturn };
  }

  /** The closed modal has left the document (or there was none): the layer and the scroll lock end. */
  release(): void {
    this.stopLayer();
    this.unlock?.();
    this.unlock = null;
  }

  /**
   * Returns focus a frame later, so the removal of the dialog and the blur of a press have settled.
   *
   * @param capturing - A return is still to be captured (the layer has not seen the close yet): the flush comes again.
   */
  flushReturn(capturing: boolean): void {
    const pending = this.pendingReturn;
    this.pendingReturn = null;
    if (!pending) {
      if (!capturing && !this.returnScheduled) this.options.returned();
      return;
    }
    this.returnScheduled = true;
    scheduleFocus(pending.doc, () => {
      this.returnScheduled = false;
      if (!this.options.isOpen()) pending.focusReturn.restore();
      this.options.returned();
    });
  }

  /** Removes the dismiss layer; safe to call when there is none. */
  private stopLayer(): void {
    const layer = this.dismissLayer;
    if (!layer) return;
    layer.destroy();
    if (this.options.layer.current === layer) this.options.layer.current = null;
    this.dismissLayer = null;
    this.exited = false;
  }
}
