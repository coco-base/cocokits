import { containsDeep } from '@cocokits/utils';
import { deepActiveElement } from '../deep-active-element';

/** Options of {@link captureFocusReturn}. */
export interface FocusReturnOptions {
  /** Returns the element that opened the overlay, or `null` when it is gone or there is none. */
  readonly getTrigger: () => HTMLElement | null;
  /**
   * Where focus goes back to.
   * `'trigger'` is the trigger, and `'opener'` is the element that had focus when {@link captureFocusReturn} ran.
   * Use `'opener'` for a dialog without a trigger.
   *
   * @cckValue trigger - Focus goes back to the trigger.
   * @cckValue opener - Focus goes back to the element that had focus when the function ran.
   * @defaultValue 'trigger'
   */
  readonly restoreTo?: 'opener' | 'trigger' | undefined;
  /**
   * The document the overlay belongs to. Set it when the overlay has no trigger or content yet, such as a
   * dialog without a trigger in an iframe or a shadow tree.
   * When not set, the document comes from the trigger or the content.
   */
  readonly document?: Document | undefined;
  /**
   * Returns the overlay content. Focus inside it still belongs to the overlay, so closing returns it to the trigger.
   * Focus anywhere else is left alone, and when this is not set, any focused element counts as outside.
   */
  readonly getContent?: (() => Element | null) | undefined;
}

/** Returns focus to the trigger when an overlay closes. */
export interface FocusReturn {
  /**
   * Focuses the trigger or the opener. When it is gone, focus goes to the element that stands for it: the trigger of
   * the overlay that had focus when this one opened, such as the menu whose item opened a dialog. When there is none,
   * focus goes to the body of its document.
   * It does nothing when the user already moved focus to another element outside the overlay, such as a button they clicked.
   */
  restore(): void;
  /** Stops the return. After this, `restore()` does nothing. */
  destroy(): void;
}

/** A focus return whose overlay is open or closing: it has not restored focus yet. */
interface Pending {
  /** The order of the capture; an overlay opened from this one has a higher one. */
  readonly order: number;
  readonly getContent: () => Element | null;
  /** Gives it the element that stands for its own target when that is gone. */
  readonly standIn: (target: () => HTMLElement | null) => void;
}

const pendingReturns = new WeakMap<Document, Set<Pending>>();
let captures = 0;

function pendingIn(doc: Document): Set<Pending> {
  let set = pendingReturns.get(doc);
  if (!set) pendingReturns.set(doc, (set = new Set()));
  return set;
}

/**
 * The overlay that has focus now and was opened while this one was open, such as a dialog that an item of this menu
 * opened. Pending returns whose content left the document are dropped: they can never hold focus again.
 */
function openedFrom(self: Pending, doc: Document, active: Element): Pending | undefined {
  const set = pendingIn(doc);
  let found: Pending | undefined;
  for (const other of set) {
    const content = other.getContent();
    if (content && !content.isConnected) set.delete(other);
    else if (other.order > self.order && content && containsDeep(content, active)) found = other;
  }
  return found;
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
 * Prepares the return of focus when an overlay closes. Call it when the overlay opens, and call `restore()` when it closes.
 *
 * @remarks
 * Call it before the overlay attaches. It remembers the document and, with `restoreTo: 'opener'`, the focused
 * element then, in case they are gone later.
 *
 * @param options - The trigger, and optionally the content, the document and where focus goes back to.
 * @returns The focus return. Call `restore()` when the overlay closes and `destroy()` when you are done.
 * @example
 * const trigger = document.querySelector<HTMLElement>('#trigger')!;
 * const dialog = document.querySelector<HTMLDialogElement>('#dialog')!;
 * const focusReturn = captureFocusReturn({ getTrigger: () => trigger, getContent: () => dialog });
 * dialog.showModal();
 * // When the dialog closes:
 * focusReturn.restore();
 * focusReturn.destroy();
 */
export function captureFocusReturn(options: FocusReturnOptions): FocusReturn {
  const first = options.getTrigger();
  const remembered = options.document ?? first?.ownerDocument ?? options.getContent?.()?.ownerDocument ?? null;
  const opener = options.restoreTo === 'opener' ? captureOpener(remembered) : null;
  let destroyed = false;
  let standIn: () => HTMLElement | null = () => null;
  /** The target when it is still in the document, else the element that stands for it. */
  const resolve = (): HTMLElement | null => {
    const target = opener ?? options.getTrigger();
    return target?.isConnected ? target : standIn();
  };
  const self: Pending = {
    order: (captures += 1),
    getContent: () => options.getContent?.() ?? null,
    standIn: (target) => {
      standIn = target;
    },
  };
  if (remembered) pendingIn(remembered).add(self);
  const settle = (): void => {
    if (remembered) pendingIn(remembered).delete(self);
  };
  return {
    restore() {
      if (destroyed) return;
      settle();
      const doc = (opener ?? options.getTrigger())?.ownerDocument ?? remembered;
      if (!doc) return;
      const active = deepActiveElement(doc);
      if (movedAway(doc, active, self.getContent())) {
        // The focus is in an overlay opened from this one: when its own target goes, this target stands for it.
        if (active) openedFrom(self, doc, active)?.standIn(resolve);
        return;
      }
      const target = resolve();
      if (target) target.focus();
      else {
        // The body is not focusable by itself: blur what still has focus so the document falls back to it.
        (active as HTMLElement | null)?.blur();
        doc.body.focus();
      }
    },
    destroy() {
      destroyed = true;
      settle();
    },
  };
}
