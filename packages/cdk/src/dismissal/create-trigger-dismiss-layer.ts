import { containsDeep } from '@cocokits/utils';
import { deepActiveElement } from '../deep-active-element';
import { createDismissLayer } from './create-dismiss-layer';
import type { DismissLayer } from './create-dismiss-layer';
import type { DismissIntent } from './dismiss-intent';

/** What {@link createTriggerDismissLayer} reads from the overlay and asks of it. */
export interface TriggerDismissHost {
  /** The trigger, which keeps DOM focus while the list is open. */
  readonly trigger: () => HTMLElement | null;
  /** The elements a press does not dismiss: the trigger, the field box and the list. */
  readonly inside: () => readonly (Element | null)[];
  /** The layer the list opened from, if any. */
  readonly parent: () => DismissLayer | null;
  /** Asks to close with Escape: `false` refuses, and the layers below stay open. */
  readonly escape: (intent: DismissIntent) => boolean;
  /**
   * Asks to close after a press outside, once, at the moment the layer raises it. `focusLeft` tells whether the
   * press moves the focus off the trigger. `false` refuses, and the layers below stay open.
   */
  readonly press: (intent: DismissIntent, focusLeft: boolean) => boolean;
  /** While `true`, the blur of the trigger does not close the list: a press is being decided. */
  readonly holdFocusOut: (held: boolean) => void;
}

/**
 * The dismiss layer of an open list whose focus stays on a trigger (a Select). Escape and a press outside are asked of
 * the host at once, inside the layer walk, so a refusal keeps the layers below open.
 *
 * A press outside also moves the focus off the trigger, before or after the layer sees it depending on the pointer,
 * and the blur of the trigger would close the list on its own. So from the `pointerdown` until the press has ended
 * (`click`, `pointercancel`, or the next task for a mouse or pen) the host holds the focus-out. A mouse or pen press
 * has not moved the focus yet when the layer sees it, so `focusLeft` is `true` for it; a touch press has moved it
 * already, and `focusLeft` is read. A refused press keeps the focus on the trigger: a touch press gives it back, a
 * mouse or pen press loses its `mousedown` default action, which is the focus move.
 *
 * The listeners are on the document in the capture phase, because a press has to be decided before the focus
 * moves; they live as long as the layer.
 *
 * @param host - What the layer reads and asks.
 * @returns The layer, and `stop`, which removes the layer and its listeners and releases the hold. Idempotent.
 */
export function createTriggerDismissLayer(host: TriggerDismissHost): {
  readonly layer: DismissLayer;
  readonly stop: () => void;
} {
  const doc = host.trigger()?.ownerDocument;
  let fallback: ReturnType<typeof setTimeout> | undefined;
  let dropKeep: (() => void) | undefined;
  const release = (): void => {
    clearTimeout(fallback);
    host.holdFocusOut(false);
  };
  const isInside = (target: Node | null): boolean =>
    host.inside().some((element) => element && target && containsDeep(element, target));
  const onPressStart = (event: PointerEvent): void => {
    if (isInside((event.composedPath()[0] ?? event.target) as Node | null)) return;
    host.holdFocusOut(true);
    clearTimeout(fallback);
    if (event.pointerType !== 'touch') fallback = setTimeout(release, 0);
  };
  const onPressEnd = (): void => {
    clearTimeout(fallback);
    fallback = setTimeout(release, 0);
  };
  /** A refused press keeps the list open and the focus on the trigger. */
  const keepFocus = (press: PointerEvent, trigger: HTMLElement, document: Document): void => {
    if (press.pointerType === 'touch') {
      trigger.focus({ preventScroll: true });
      release();
      return;
    }
    const keep = (event: Event): void => {
      event.preventDefault();
    };
    document.addEventListener('mousedown', keep, { capture: true, once: true });
    dropKeep = () => {
      document.removeEventListener('mousedown', keep, true);
      dropKeep = undefined;
    };
    clearTimeout(fallback);
    fallback = setTimeout(() => {
      dropKeep?.();
      release();
    }, 0);
  };
  const onPress = (intent: DismissIntent): void => {
    const trigger = host.trigger();
    const press = intent.event as PointerEvent;
    const touch = press.pointerType === 'touch';
    const focusLeft = !touch || !doc || deepActiveElement(doc) !== trigger;
    if (host.press(intent, focusLeft)) return;
    intent.preventDefault();
    if (trigger && doc) keepFocus(press, trigger, doc);
  };

  const layer = createDismissLayer({
    getInsideElements: host.inside,
    onDismiss: (intent) => {
      if (intent.reason === 'escape') {
        if (!host.escape(intent)) intent.preventDefault();
      } else if (intent.reason === 'outside-press') onPress(intent);
    },
    getParent: host.parent,
  });
  doc?.addEventListener('pointerdown', onPressStart, true);
  doc?.addEventListener('click', onPressEnd, true);
  doc?.addEventListener('pointercancel', onPressEnd, true);
  return {
    layer,
    stop: () => {
      doc?.removeEventListener('pointerdown', onPressStart, true);
      doc?.removeEventListener('click', onPressEnd, true);
      doc?.removeEventListener('pointercancel', onPressEnd, true);
      dropKeep?.();
      release();
      layer.destroy();
    },
  };
}
