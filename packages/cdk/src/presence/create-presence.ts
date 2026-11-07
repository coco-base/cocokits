import { awaitedAnimations, settleAnimations } from './wait-for-animations';

/** Where an overlay is in its life: shown, playing its exit, or gone. */
export type PresenceState = 'mounted' | 'exiting' | 'unmounted';

/** Options of {@link createPresence}. */
export interface PresenceOptions {
  /** The element whose CSS animations the exit waits for; `null` when it is not rendered. */
  readonly getElement: () => HTMLElement | null;
  /** Called after every change of the state. */
  readonly onStateChange: (state: PresenceState) => void;
}

/** Mount and unmount timing for an overlay with an exit animation. */
export interface Presence {
  /**
   * Opens or closes. Opening cancels a running exit. Closing starts the exit and reports `unmounted`
   * once every CSS animation on the element that is running and finite has finished, or at once when
   * none is. CSS transitions, paused or infinite animations and `element.animate()` animations are not awaited.
   * Call it with `false` after the closed state is rendered (for example in the adapter's post-render
   * effect), so the exit animation already exists when it is read.
   */
  setOpen(open: boolean): void;
  /** The current state. */
  readonly state: () => PresenceState;
  /** Stops waiting. Later calls do nothing. */
  destroy(): void;
}

/**
 * Creates the presence of one overlay. On close it waits, by the rule of {@link waitForAnimations}, for
 * the element's CSS animations that are running and have a finite end, read once when the exit starts,
 * and never for a timeout. Unlike that helper it unmounts synchronously when nothing is awaited, so an
 * overlay without such an animation unmounts at once. CSS transitions and animations made with
 * `element.animate()` are not awaited. A canceled animation counts as finished.
 *
 * @param options - The element getter and the state callback.
 * @returns The presence; call `destroy()` when the overlay is disposed.
 */
export function createPresence(options: PresenceOptions): Presence {
  let state: PresenceState = 'unmounted';
  let generation = 0;
  let destroyed = false;

  const change = (next: PresenceState): void => {
    if (state === next) return;
    state = next;
    options.onStateChange(next);
  };

  const exit = (): void => {
    const animations = awaitedAnimations(options.getElement());
    if (animations.length === 0) {
      change('unmounted');
      return;
    }
    const current = generation;
    void settleAnimations(animations).then(() => {
      if (!destroyed && current === generation && state === 'exiting') change('unmounted');
    });
  };

  return {
    setOpen(open) {
      if (destroyed) return;
      generation += 1;
      if (open) {
        change('mounted');
      } else if (state === 'mounted') {
        change('exiting');
        exit();
      }
    },
    state: () => state,
    destroy() {
      destroyed = true;
      generation += 1;
    },
  };
}
