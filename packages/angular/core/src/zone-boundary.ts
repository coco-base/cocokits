import { NgZone, inject } from '@angular/core';

/** Runs work outside the Angular zone and brings its results back in. @internal */
export interface ZoneBoundary {
  /**
   * Runs `fn` outside NgZone, so the listeners and timers it starts do not trigger a change detection for every
   * event. It calls `fn` plainly when there is no NgZone or it is a no-op zone (zoneless).
   */
  outside<T>(fn: () => T): T;
  /**
   * Runs `fn` inside NgZone. Wrap every callback that writes component state, emits an output or emits on a ref
   * stream, when it is called from work started with `outside`. It calls `fn` plainly when there is no NgZone.
   */
  inside<T>(fn: () => T): T;
}

/**
 * The narrow zone boundary of the overlay roots: the document listeners of the dismiss layer, positioning,
 * focus-visible tracking and delay timers start outside NgZone, and only the callbacks that change state come
 * back in. Call it in an injection context.
 *
 * @example
 * ```ts
 * const zone = injectZoneBoundary();
 * const layer = zone.outside(() => createDismissLayer({ onDismiss: (intent) => zone.inside(() => this.close(intent)) }));
 * ```
 * @internal
 */
export function injectZoneBoundary(): ZoneBoundary {
  const zone = inject(NgZone, { optional: true });
  return {
    outside: (fn) => (zone ? zone.runOutsideAngular(fn) : fn()),
    inside: (fn) => (zone ? zone.run(fn) : fn()),
  };
}
