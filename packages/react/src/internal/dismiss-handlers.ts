import type { DismissIntent } from '@cocokits/cdk/dismissal';

/** The cancelable event `onPointerDownOutside` receives: the press is `detail.originalEvent`. */
export type PointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;

/** The cancelable event `onFocusOutside` receives: the focus is `detail.originalEvent`. */
export type FocusOutsideEvent = CustomEvent<{ originalEvent: FocusEvent }>;

/** The Content handlers that can refuse a dismissal. A handler refuses with `event.preventDefault()`. */
export interface DismissHandlers {
  readonly onEscapeKeyDown?: ((event: KeyboardEvent) => void) | undefined;
  readonly onPointerDownOutside?: ((event: PointerDownOutsideEvent) => void) | undefined;
  readonly onFocusOutside?: ((event: FocusOutsideEvent) => void) | undefined;
  readonly onInteractOutside?: ((event: PointerDownOutsideEvent & FocusOutsideEvent) => void) | undefined;
}

/**
 * Gives a dismiss intent to the Content handlers in this order: the specific handler, then `onInteractOutside`
 * with the same event. A handler that calls `preventDefault()` refuses the intent. A close request with no key
 * (the dialog's `cancel`) reaches no key handler.
 *
 * @param intent - The intent the cdk raised.
 * @param handlers - The handlers of the Content, read now.
 */
export function runDismissHandlers(intent: DismissIntent, handlers: DismissHandlers): void {
  const { reason, event } = intent;
  if (reason === 'escape') {
    if (event.type !== 'keydown' || !handlers.onEscapeKeyDown) return;
    // The cdk prevents the keydown only after the intent, so a prevented keydown is the handler's refusal.
    handlers.onEscapeKeyDown(event as KeyboardEvent);
    if (event.defaultPrevented) intent.preventDefault();
    return;
  }
  const custom = new CustomEvent('dismiss', { cancelable: true, detail: { originalEvent: event } });
  if (reason === 'outside-press') handlers.onPointerDownOutside?.(custom as PointerDownOutsideEvent);
  else handlers.onFocusOutside?.(custom as FocusOutsideEvent);
  handlers.onInteractOutside?.(custom as PointerDownOutsideEvent & FocusOutsideEvent);
  if (custom.defaultPrevented) intent.preventDefault();
}

/**
 * Asks a focus hook whether CocoKits may move focus: the hook gets a cancelable event and prevents it to stop the
 * move.
 *
 * @param name - The event type, for the handler's benefit.
 * @param handler - `onOpenAutoFocus` or `onCloseAutoFocus`, when given.
 * @returns `false` when the handler prevented the event.
 */
export function allowsAutoFocus(
  name: 'focus-open' | 'focus-close',
  handler: ((event: Event) => void) | undefined,
): boolean {
  const event = new Event(name, { cancelable: true });
  handler?.(event);
  return !event.defaultPrevented;
}
