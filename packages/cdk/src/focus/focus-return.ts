import { containsDeep } from '@cocokits/utils';
import { deepActiveElement } from '../deep-active-element';

/** Options of {@link captureFocusReturn}. */
export interface FocusReturnOptions {
  /** The element that opened the overlay; `null` when it is gone or there is none. */
  readonly getTrigger: () => HTMLElement | null;
  /**
   * Where focus goes back to. `'trigger'` is the trigger. `'opener'` is the element that had focus when
   * {@link captureFocusReturn} was called, so call it before the overlay attaches: a modal dialog returns focus
   * to its opener, which a dialog without a trigger needs. With nothing focused the trigger stands in for it, as the trigger is when `restore()` runs, else the body.
   * @defaultValue 'trigger'
   */
  readonly restoreTo?: 'opener' | 'trigger' | undefined;
  /**
   * The document the overlay belongs to, for a capture before the overlay has a trigger or content (a dialog
   * without a trigger, in an iframe or a shadow tree). Without it the document comes from the trigger or the content.
   */
  readonly document?: Document | undefined;
  /**
   * The overlay content. Focus inside it still belongs to the overlay, so closing returns it to the
   * trigger; focus anywhere else outside is left alone.
   */
  readonly getContent?: (() => Element | null) | undefined;
}

/** Returns focus to the trigger when an overlay closes. */
export interface FocusReturn {
  /**
   * Focuses the trigger or opener, or the body of its document when it is gone or disconnected. It does
   * nothing when the user moved focus to another focusable element outside the overlay (an outside
   * click on a button keeps focus there).
   */
  restore(): void;
  /** Stops the return. `restore()` does nothing afterwards. */
  destroy(): void;
}

/** Whether the user moved focus to a focusable element outside the overlay content. */
function movedAway(doc: Document, active: Element | null, content: Element | null): boolean {
  if (active === null || active === doc.body || active === doc.documentElement) return false;
  return !(content && containsDeep(content, active));
}

/** The deep active element, or `null` when nothing has focus (Safari does not focus a button on click). */
function captureOpener(doc: Document | null): HTMLElement | null {
  const active = doc ? deepActiveElement(doc) : null;
  return active && active !== doc?.body && active !== doc?.documentElement ? (active as HTMLElement) : null;
}

/**
 * Prepares the focus return of an overlay. Call it when the overlay opens, before it attaches (the
 * document and, with `restoreTo: 'opener'`, the focused element are remembered then, for the case that
 * they are gone later) and `restore()` when it closes.
 *
 * @param options - The trigger getter, and optionally the content getter.
 * @returns The focus return.
 */
export function captureFocusReturn(options: FocusReturnOptions): FocusReturn {
  const first = options.getTrigger();
  const remembered = options.document ?? first?.ownerDocument ?? options.getContent?.()?.ownerDocument ?? null;
  const opener = options.restoreTo === 'opener' ? captureOpener(remembered) : null;
  let destroyed = false;
  return {
    restore() {
      if (destroyed) return;
      const target = opener ?? options.getTrigger();
      const doc = target?.ownerDocument ?? remembered;
      if (!doc) return;
      const active = deepActiveElement(doc);
      if (movedAway(doc, active, options.getContent?.() ?? null)) return;
      if (target?.isConnected) target.focus();
      else {
        // The body is not focusable by itself: blur what still has focus so the document falls back to it.
        (active as HTMLElement | null)?.blur();
        doc.body.focus();
      }
    },
    destroy() {
      destroyed = true;
    },
  };
}
