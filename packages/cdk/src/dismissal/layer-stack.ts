import { createIntent } from './dismiss-intent';
import type { DismissIntent } from './dismiss-intent';
import { createIosCursor } from './ios-cursor';
import { eventTarget, isModal, orderLayers } from './layer';
import type { Layer } from './layer';
import { collectLayers, isScrollbarPress } from './press';
import type { DismissReason } from './dismiss-reason';

interface DocumentStack {
  /** Registration order; use {@link orderLayers} for the stack. */
  readonly layers: Layer[];
  readonly cursor: ReturnType<typeof createIosCursor>;
  readonly stop: () => void;
}

const stacks = new WeakMap<Document, DocumentStack>();

/** `keyCode` 229 is how Safari reports the key that ends an IME composition, after `isComposing` is already false. */
const IME_KEY_CODE = 229;

function isComposing(event: KeyboardEvent): boolean {
  return event.isComposing || Reflect.get(event, 'keyCode') === IME_KEY_CODE;
}

/** Gives the layers their intents from the top down; a refused intent stops the rest and is returned. */
function raise(collected: readonly Layer[], reason: DismissReason, event: Event): DismissIntent | null {
  for (const layer of collected) {
    if (layer.destroyed || layer.exited) continue;
    const intent = createIntent(reason, event);
    layer.onDismiss(intent);
    if (intent.defaultPrevented) return intent;
  }
  return null;
}

/** The layers that can take an event: an exited layer takes none, but an exited modal still stands in the way. */
function active(layers: readonly Layer[]): Layer[] {
  return orderLayers(layers).filter((layer) => !layer.exited || isModal(layer));
}

function start(doc: Document, layers: Layer[]): () => void {
  // An Escape keydown is in flight until its default action (the dialog's `cancel`) has run.
  let escapeInFlight = false;
  let clearInFlight: ReturnType<typeof setTimeout> | undefined;
  // A press is decided when it starts but dispatched after the target's handlers could prevent it: a mouse or pen
  // press in the bubble phase, a touch press on the `click` that follows (a scroll, a pan or a long press has none).
  let pressed: { collected: readonly Layer[]; event: Event } | null = null;
  // A refused `cancel` that the browser would not let us prevent (not cancelable: its close watcher) closes the dialog
  // anyway, and the `close` event is queued as a later task. The mark waits for that event, with no timer.
  let forcedClose: HTMLDialogElement | null = null;

  const onKeyDownStart = (event: KeyboardEvent): void => {
    pressed = null;
    if (event.key !== 'Escape') return;
    escapeInFlight = true;
    clearTimeout(clearInFlight);
    clearInFlight = setTimeout(() => {
      escapeInFlight = false;
    }, 0);
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || event.defaultPrevented || isComposing(event)) return;
    const top = active(layers).at(-1);
    if (!top) return;
    if (top.exited) {
      // An exiting modal is still shown: Escape must neither close it natively nor reach a layer below it.
      event.preventDefault();
      return;
    }
    if (!top.dismissOn.has('escape')) return;
    // Prevented after the intent, so a handler that refuses is the first to prevent the keydown.
    raise([top], 'escape', event);
    event.preventDefault();
  };

  const onCancel = (event: Event): void => {
    if (event.defaultPrevented || !layers.some((layer) => layer.getDialog?.() === event.target)) return;
    event.preventDefault();
    // A keydown that an inner element stopped still ends in a native `cancel`; it is not a close request.
    if (escapeInFlight) return;
    const top = active(layers).at(-1);
    if (!top || top.exited || !top.dismissOn.has('escape')) return;
    if (!raise([top], 'escape', event)) return;
    forcedClose = event.cancelable ? null : (event.target as HTMLDialogElement);
  };

  const onClose = (event: Event): void => {
    const dialog = forcedClose;
    if (!dialog || event.target !== dialog) return;
    forcedClose = null;
    const owner = layers.find((layer) => layer.getDialog?.() === dialog && !layer.destroyed && !layer.exited);
    if (owner) owner.onDismiss(createIntent('escape', event, false));
  };

  const onPointerDown = (event: PointerEvent): void => {
    pressed = null;
    if (event.defaultPrevented) return;
    const target = eventTarget(event);
    if (isScrollbarPress(doc, event, target)) return;
    const collected = collectLayers(orderLayers(layers), 'outside-press', target, event);
    if (collected.length > 0) pressed = { collected, event };
  };

  const dispatchPress = (press: typeof pressed): void => {
    if (press && !press.event.defaultPrevented) raise(press.collected, 'outside-press', press.event);
  };

  const onPointerDownBubble = (event: PointerEvent): void => {
    const press = pressed;
    if (press?.event !== event || event.pointerType === 'touch') return;
    pressed = null;
    dispatchPress(press);
  };

  const onClick = (): void => {
    const press = pressed;
    pressed = null;
    if ((press?.event as PointerEvent | undefined)?.pointerType === 'touch') dispatchPress(press);
  };

  const onPointerCancel = (): void => {
    pressed = null;
  };

  const onFocusIn = (event: FocusEvent): void => {
    raise(collectLayers(orderLayers(layers), 'focus-out', eventTarget(event)), 'focus-out', event);
  };

  doc.addEventListener('keydown', onKeyDownStart, true);
  doc.addEventListener('keydown', onKeyDown);
  doc.addEventListener('cancel', onCancel, true);
  doc.addEventListener('close', onClose, true);
  doc.addEventListener('pointerdown', onPointerDown, true);
  doc.addEventListener('pointerdown', onPointerDownBubble);
  doc.addEventListener('pointercancel', onPointerCancel, true);
  doc.addEventListener('click', onClick, true);
  doc.addEventListener('focusin', onFocusIn, true);
  return () => {
    clearTimeout(clearInFlight);
    doc.removeEventListener('close', onClose, true);
    doc.removeEventListener('pointerdown', onPointerDownBubble);
    doc.removeEventListener('keydown', onKeyDownStart, true);
    doc.removeEventListener('keydown', onKeyDown);
    doc.removeEventListener('cancel', onCancel, true);
    doc.removeEventListener('pointerdown', onPointerDown, true);
    doc.removeEventListener('pointercancel', onPointerCancel, true);
    doc.removeEventListener('click', onClick, true);
    doc.removeEventListener('focusin', onFocusIn, true);
  };
}

function syncCursor(stack: DocumentStack): void {
  stack.cursor.sync(stack.layers.some((layer) => !layer.exited && layer.dismissOn.has('outside-press')));
}

/** @internal Adds a layer on top of the document's stack; the first one starts the listeners. */
export function addLayer(doc: Document, layer: Layer): void {
  let stack = stacks.get(doc);
  if (!stack) {
    const layers: Layer[] = [];
    stack = { layers, cursor: createIosCursor(doc), stop: start(doc, layers) };
    stacks.set(doc, stack);
  }
  stack.layers.push(layer);
  syncCursor(stack);
}

/** @internal Marks a layer exited: it raises no intent from now on. */
export function exitLayer(doc: Document, layer: Layer): void {
  layer.exited = true;
  const stack = stacks.get(doc);
  if (stack) syncCursor(stack);
}

/** @internal Removes a layer; the last one stops the listeners. */
export function removeLayer(doc: Document, layer: Layer): void {
  layer.destroyed = true;
  const stack = stacks.get(doc);
  if (!stack) return;
  const index = stack.layers.indexOf(layer);
  if (index >= 0) stack.layers.splice(index, 1);
  syncCursor(stack);
  if (stack.layers.length === 0) {
    stack.stop();
    stacks.delete(doc);
  }
}
