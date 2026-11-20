import type { DismissReason } from './dismiss-reason';

/**
 * One request to close an overlay, raised before anything closes.
 * You can refuse it with `preventDefault()`. Otherwise you close the overlay yourself, because the layer never closes anything.
 */
export interface DismissIntent {
  /** Why the layer asks to close. */
  readonly reason: DismissReason;
  /**
   * The event that raised the request.
   * It is a `KeyboardEvent` for a key, a `PointerEvent` for a press, or a `FocusEvent` for a focus-out.
   * For a close request of a native dialog, it is the `cancel` event, or the `close` event when the browser already forced the close.
   */
  readonly event: Event;
  /** Whether a handler has called {@link DismissIntent.preventDefault}. */
  readonly defaultPrevented: boolean;
  /**
   * Refuses the request. The overlay stays open, and for a press or a focus-out the layers below it stay open too.
   *
   * It does nothing for an `escape` intent whose event is the `close` event of a dialog. The browser has already closed that dialog, because its close watcher forces a close after a refused `cancel`. Close your own state to match.
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
