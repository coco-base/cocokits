/** Whether the last input of a document was the keyboard. */
export interface FocusVisibleTracker {
  /** `true` when focus should show as focus-visible: after a key press, or before any input. */
  readonly isFocusVisible: () => boolean;
  /** Releases the tracker; the listeners go with the last one. Idempotent. */
  destroy(): void;
}

interface Tracking {
  count: number;
  keyboard: boolean;
  stop: () => void;
}

const trackings = new WeakMap<Document, Tracking>();

const MODIFIER_KEYS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock']);

function start(doc: Document): Tracking {
  const tracking: Tracking = { count: 0, keyboard: true, stop: () => undefined };
  const onKeyDown = (event: KeyboardEvent): void => {
    if (!MODIFIER_KEYS.has(event.key) && !event.metaKey && !event.ctrlKey && !event.altKey) tracking.keyboard = true;
  };
  const onPointer = (): void => {
    tracking.keyboard = false;
  };
  doc.addEventListener('keydown', onKeyDown, true);
  doc.addEventListener('pointerdown', onPointer, true);
  doc.addEventListener('mousedown', onPointer, true);
  tracking.stop = () => {
    doc.removeEventListener('keydown', onKeyDown, true);
    doc.removeEventListener('pointerdown', onPointer, true);
    doc.removeEventListener('mousedown', onPointer, true);
  };
  return tracking;
}

/**
 * Tracks the input modality of a document so a component can render `data-focus-visible`. The
 * listeners are shared and counted per document. A focus that arrives when the window regains
 * focus reports the modality of the last input.
 *
 * @param doc - The document to track.
 * @returns A tracker; call `destroy()` when the component is disposed.
 */
export function trackFocusVisible(doc: Document): FocusVisibleTracker {
  let tracking = trackings.get(doc);
  if (!tracking) {
    tracking = start(doc);
    trackings.set(doc, tracking);
  }
  const held = tracking;
  held.count += 1;
  let released = false;
  return {
    isFocusVisible: () => held.keyboard,
    destroy() {
      if (released) return;
      released = true;
      held.count -= 1;
      if (held.count > 0) return;
      held.stop();
      trackings.delete(doc);
    },
  };
}
