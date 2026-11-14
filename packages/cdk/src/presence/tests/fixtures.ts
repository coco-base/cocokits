export interface FakeAnimation {
  finished: Promise<unknown>;
  playState?: string;
  effect?: { getComputedTiming: () => { endTime: number } };
  animationName?: string;
}

/** A CSS animation as `getAnimations()` returns it: it has an animation name, runs and ends in 300 ms. */
export function cssAnimation(finished: Promise<unknown>, overrides: Partial<FakeAnimation> = {}): FakeAnimation {
  return {
    finished,
    animationName: 'exit',
    playState: 'running',
    effect: { getComputedTiming: () => ({ endTime: 300 }) },
    ...overrides,
  };
}
