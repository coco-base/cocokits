import type { DismissIntent } from '@cocokits/cdk/dismissal';
import type { FocusOutsideEvent, PointerDownOutsideEvent } from '@cocokits/vue-core';

/** The emits of an overlay content that can refuse a dismissal; a content without a cause leaves its emit out. */
export interface DismissHandlers {
  readonly escapeKeyDown: (event: KeyboardEvent) => void;
  readonly pointerDownOutside: (event: PointerDownOutsideEvent) => void;
  readonly focusOutside?: ((event: FocusOutsideEvent) => void) | undefined;
  readonly interactOutside?: ((event: PointerDownOutsideEvent | FocusOutsideEvent) => void) | undefined;
}

/**
 * Runs the content's emits for one dismiss intent, in the order of Reka UI: the specific one, then
 * `interactOutside` with the same event. A listener refuses with `preventDefault()` (or `.prevent`); the intent is
 * then refused too, so the layers below stay open. The emits run listeners synchronously, so the answer is known
 * when this returns. A close request without a key (the dialog's `cancel`, or the `close` the browser forced) is
 * no keydown and reaches no listener: only the controlled `v-model:open` refuses it.
 *
 * @internal
 * @param intent - The intent the layer raised.
 * @param handlers - The emits of the content.
 * @returns Whether a listener refused it.
 */
export function dismissRefused(intent: DismissIntent, handlers: DismissHandlers): boolean {
  const { event } = intent;
  let refused: boolean;
  if (intent.reason === 'escape') {
    if (event.type !== 'keydown') return false;
    // The cdk prevents the keydown only after the intent, so a prevented keydown is a listener's refusal.
    handlers.escapeKeyDown(event as KeyboardEvent);
    refused = event.defaultPrevented;
  } else if (intent.reason === 'outside-press') {
    const custom = new CustomEvent('pointerDownOutside', { cancelable: true, detail: { originalEvent: event } });
    handlers.pointerDownOutside(custom as PointerDownOutsideEvent);
    handlers.interactOutside?.(custom as PointerDownOutsideEvent);
    refused = custom.defaultPrevented;
  } else {
    const custom = new CustomEvent('focusOutside', { cancelable: true, detail: { originalEvent: event } });
    handlers.focusOutside?.(custom as FocusOutsideEvent);
    handlers.interactOutside?.(custom as FocusOutsideEvent);
    refused = custom.defaultPrevented;
  }
  if (refused) intent.preventDefault();
  return refused;
}
