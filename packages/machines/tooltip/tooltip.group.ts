/** Options of {@link createTooltipGroup}. */
export interface TooltipGroupOptions {
  /**
   * Milliseconds after a tooltip of the group closes during which the next hover opens without delay.
   * `0` or less turns the group off: every hover waits its own delay.
   * @defaultValue 300
   */
  readonly skipDelayDuration?: number | undefined;
  /** The clock, in milliseconds. Replace it in tests. @defaultValue Date.now */
  readonly now?: (() => number) | undefined;
}

/**
 * The shared state of the tooltips inside one provider. The adapters create one per provider and call it
 * from every tooltip of the group. It holds no timer and touches no DOM.
 */
export interface TooltipGroup {
  /**
   * The delay a hover on a tooltip of the group waits: `0` while another tooltip of the group is open or
   * closed less than `skipDelayDuration` ms ago, otherwise `delay`.
   *
   * @param delay - The tooltip's own delay.
   */
  delayFor(delay: number): number;
  /** A tooltip of the group opened. */
  opened(): void;
  /** A tooltip of the group closed; the skip window starts. */
  closed(): void;
}

/**
 * Creates the delay group of a provider: after one tooltip opens, the next hover in the group opens without
 * delay, and keeps doing so for `skipDelayDuration` ms after the last one closed.
 *
 * @param options - The skip window and the clock.
 * @returns The group.
 */
export function createTooltipGroup(options: TooltipGroupOptions = {}): TooltipGroup {
  const skip = options.skipDelayDuration ?? 300;
  const now = options.now ?? Date.now;
  let isOpen = false;
  let closedAt: number | null = null;
  return {
    delayFor(delay) {
      if (skip <= 0) return delay;
      if (isOpen) return 0;
      return closedAt !== null && now() - closedAt < skip ? 0 : delay;
    },
    opened() {
      isOpen = true;
    },
    closed() {
      isOpen = false;
      closedAt = now();
    },
  };
}
