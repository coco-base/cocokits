import type { DismissReason } from './dismiss-reason';

/**
 * One request to close an overlay, raised before anything closes. The adapter refuses it with
 * `preventDefault()`; otherwise it closes the overlay. The cdk never closes anything itself.
 */
export interface DismissIntent {
  /** Why the layer asks to close. */
  readonly reason: DismissReason;
  /** The `KeyboardEvent` of a key, the dialog's `cancel` event of a close request (its `close` event when the browser forced the close), a `PointerEvent` or a `FocusEvent`. */
  readonly event: Event;
  /** `true` once a handler called {@link DismissIntent.preventDefault}. */
  readonly defaultPrevented: boolean;
  /**
   * Refuses the request: the overlay stays open and, for a press or a focus-out, the layers below it too. It does
   * nothing for an `escape` intent whose event is the dialog's `close`: the browser has closed the dialog already
   * (its close watcher forces a close after a refused `cancel`), and the adapter closes its state to match.
   */
  preventDefault(): void;
}

/** @internal A new, not yet refused intent. */
export function createIntent(reason: DismissReason, event: Event, refusable = true): DismissIntent {
  let prevented = false;
  return {
    reason,
    event,
    get defaultPrevented() {
      return prevented;
    },
    preventDefault() {
      // A close the browser already made cannot be refused.
      if (refusable) prevented = true;
    },
  };
}
