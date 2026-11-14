import { containsDeep } from '@cocokits/utils';
import { deepActiveElement } from '../deep-active-element';
import { createDismissLayer } from './create-dismiss-layer';
import type { DismissLayer } from './create-dismiss-layer';
import type { DismissIntent } from './dismiss-intent';

/** What {@link createTriggerDismissLayer} reads from your overlay and asks of it. */
export interface TriggerDismissHost {
  /** Returns the trigger. It keeps focus while the list is open. */
  readonly trigger: () => HTMLElement | null;
  /** Returns the elements that a press does not dismiss, which are the trigger, the box around it and the list. */
  readonly inside: () => readonly (Element | null)[];
  /** Returns the layer that the list opened from, or `null` when there is none. */
  readonly parent: () => DismissLayer | null;
  /**
   * Asks to close after Escape. Return `false` to refuse; the layers below then stay open.
   * @param intent - The request to close.
   * @returns Whether to close.
   */
  readonly escape: (intent: DismissIntent) => boolean;
  /**
   * Asks to close after a press outside. It runs once, at the moment the layer raises the request.
   * Return `false` to refuse; the layers below then stay open.
   * @param intent - The request to close.
   * @param focusLeft - Whether the press moves focus off the trigger.
   * @returns Whether to close.
   */
  readonly press: (intent: DismissIntent, focusLeft: boolean) => boolean;
  /**
   * Called with `true` while a press is being decided, and with `false` after it. While it is held, the blur of the trigger must not close the list.
   * @param held - Whether the focus-out is held.
   */
  readonly holdFocusOut: (held: boolean) => void;
}

/**
 * Creates the dismiss layer of an open list whose focus stays on a trigger, such as the list of a custom select.
 * Escape and a press outside are asked of your host at once, inside the layer walk, so a refusal keeps the layers below open.
 *
 * @remarks
 * A press outside also moves focus off the trigger, before or after the layer sees it depending on the pointer.
 * The blur of the trigger would then close the list on its own. So from the `pointerdown` until the press has ended,
 * your host holds the focus-out. The press has ended at `click`, at `pointercancel`, or in the next task for a mouse or pen.
 *
 * A mouse or pen press has not moved focus yet when the layer sees it, so `focusLeft` is `true` for it. A touch press
 * has moved focus already, so `focusLeft` is read.
 *
 * A refused press keeps focus on the trigger. A touch press gives focus back. A mouse or pen press loses its
 * `mousedown` default action, which is the focus move.
 *
 * The listeners are on the document in the capture phase, because a press must be decided before focus moves.
 * They live as long as the layer.
 *
 * @param host - What the layer reads and asks.
 * @returns The layer, and `stop`, which removes the layer and its listeners and releases the hold. Calling `stop` again does nothing.
 * @example
 * const trigger = document.querySelector<HTMLElement>('#trigger')!;
 * const list = document.querySelector<HTMLElement>('#list')!;
 * const { stop } = createTriggerDismissLayer({
 *   trigger: () => trigger,
 *   inside: () => [trigger, list],
 *   parent: () => null,
 *   escape: () => {
 *     list.hidden = true;
 *     return true;
 *   },
 *   press: () => {
 *     list.hidden = true;
 *     return true;
 *   },
 *   holdFocusOut: () => undefined,
 * });
 * // When the list is gone:
 * stop();
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
