import { awaitedAnimations, settleAnimations } from './wait-for-animations';

/**
 * Where an overlay is in its life: shown, playing its exit, or gone.
 *
 * @cckValue mounted - The overlay is shown.
 * @cckValue exiting - The overlay is closing and its exit animation is running.
 * @cckValue unmounted - The overlay is gone.
 */
export type PresenceState = 'mounted' | 'exiting' | 'unmounted';

/** Options of {@link createPresence}. */
export interface PresenceOptions {
  /** Returns the element whose CSS animations the exit waits for, or `null` when it is not rendered. */
  readonly getElement: () => HTMLElement | null;
  /** Called after every change of the state, with the new state. */
  readonly onStateChange: (state: PresenceState) => void;
}

/** Mount and unmount timing for an overlay with an exit animation. */
export interface Presence {
  /**
   * Opens or closes the overlay. Opening cancels a running exit.
   * Closing starts the exit and reports `unmounted` once every running, finite CSS animation on the element has finished.
   *
   * When there is no such animation, it reports `unmounted` at once.
   *
   * @remarks
   * CSS transitions, paused animations, infinite animations and `element.animate()` animations are not awaited.
   * Call it with `false` after the closed state is rendered, so the exit animation already exists when it is read.
   *
   * @param open - `true` to open, `false` to close.
   * @example
   * presence.setOpen(false);
   */
  setOpen(open: boolean): void;
  /** Returns the current state. */
  readonly state: () => PresenceState;
  /** Stops waiting. After this, calls do nothing. */
  destroy(): void;
}

/**
 * Tracks when an overlay is shown, playing its exit animation, or gone. Use it to keep an element in the
 * document until its exit animation has ended.
 *
 * @remarks
 * On close it waits for the CSS animations of the element that are running and have a finite end. It reads
 * them once, when the exit starts, and it never waits for a timeout. An animation that is canceled counts as finished.
 *
 * Unlike {@link waitForAnimations}, it unmounts at once when there is nothing to wait for.
 * CSS transitions and animations made with `element.animate()` are not awaited.
 *
 * @param options - The element and the state callback.
 * @returns The presence. Call `destroy()` when you are done.
 * @example
 * const panel = document.querySelector<HTMLElement>('#panel')!;
 * const presence = createPresence({
 *   getElement: () => panel,
 *   onStateChange: (state) => {
 *     panel.hidden = state === 'unmounted';
 *   },
 * });
 * presence.setOpen(true);
 * // To close with the exit animation:
 * presence.setOpen(false);
 * // Later, when you are done:
 * presence.destroy();
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
