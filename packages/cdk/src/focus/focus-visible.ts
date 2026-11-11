/** Whether the last input of a document was the keyboard. */
export interface FocusVisibleTracker {
  /** Returns `true` when focus should look visible: after a key press, or before any input. */
  readonly isFocusVisible: () => boolean;
  /** Releases the tracker. The listeners go away with the last tracker of the document. Calling it again does nothing. */
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
 * Tracks whether the last input in a document was the keyboard. Use it to decide when to draw a focus ring,
 * for example by setting a `data-focus-visible` attribute.
 *
 * @remarks
 * The listeners are shared and counted per document. A focus that arrives when the window regains focus
 * reports the kind of the last input.
 *
 * @param doc - The document to track.
 * @returns The tracker. Call `destroy()` when you are done.
 * @example
 * const tracker = trackFocusVisible(document);
 * const button = document.querySelector<HTMLElement>('button')!;
 * button.addEventListener('focus', () => {
 *   button.toggleAttribute('data-focus-visible', tracker.isFocusVisible());
 * });
 * // Later, when you are done:
 * tracker.destroy();
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
