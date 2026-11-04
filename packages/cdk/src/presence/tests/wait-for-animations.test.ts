// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { waitForAnimations } from '../index';

interface FakeAnimation {
  finished: Promise<unknown>;
  playState?: string;
  effect?: { getComputedTiming: () => { endTime: number } };
  animationName?: string;
}

function css(finished: Promise<unknown>, overrides: Partial<FakeAnimation> = {}): FakeAnimation {
  return {
    finished,
    animationName: 'enter',
    playState: 'running',
    effect: { getComputedTiming: () => ({ endTime: 300 }) },
    ...overrides,
  };
}

function elementWith(animations: FakeAnimation[]): HTMLElement {
  const element = document.createElement('div');
  element.getAnimations = (() => animations) as unknown as HTMLElement['getAnimations'];
  return element;
}

const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** Whether the promise resolved, after letting pending work run. */
async function resolved(promise: Promise<void>): Promise<boolean> {
  let done = false;
  void promise.then(() => {
    done = true;
  });
  await settle();
  return done;
}

describe('waitForAnimations', () => {
  it('resolves in a microtask when nothing animates, and for a null element', async () => {
    let done = false;
    const promise = waitForAnimations(elementWith([])).then(() => {
      done = true;
    });
    expect(done).toBe(false);
    await promise;
    expect(done).toBe(true);
    await expect(waitForAnimations(null)).resolves.toBeUndefined();
  });

  it('resolves when the element has no getAnimations', async () => {
    const element = document.createElement('div');
    Object.defineProperty(element, 'getAnimations', { value: undefined });
    await expect(waitForAnimations(element)).resolves.toBeUndefined();
  });

  it('waits for every running finite CSS animation', async () => {
    let finishA: () => void = () => undefined;
    let finishB: () => void = () => undefined;
    const a = css(new Promise<void>((resolve) => (finishA = resolve)));
    const b = css(new Promise<void>((resolve) => (finishB = resolve)));
    const promise = waitForAnimations(elementWith([a, b]));
    finishA();
    expect(await resolved(promise)).toBe(false);
    finishB();
    expect(await resolved(promise)).toBe(true);
  });

  it('counts a canceled animation as finished', async () => {
    const promise = waitForAnimations(elementWith([css(Promise.reject(new Error('canceled')))]));
    expect(await resolved(promise)).toBe(true);
  });

  it.each([
    {
      name: 'an infinite animation',
      animation: css(new Promise(() => undefined), { effect: { getComputedTiming: () => ({ endTime: Infinity }) } }),
    },
    { name: 'a paused animation', animation: css(new Promise(() => undefined), { playState: 'paused' }) },
    { name: 'a finished animation', animation: css(new Promise(() => undefined), { playState: 'finished' }) },
    {
      name: 'a transition or element.animate() (no animation name)',
      animation: {
        finished: new Promise(() => undefined),
        playState: 'running',
        effect: { getComputedTiming: () => ({ endTime: 300 }) },
      },
    },
  ])('does not wait for $name', async ({ animation }) => {
    expect(await resolved(waitForAnimations(elementWith([animation])))).toBe(true);
  });

  it('reads the animations at the call, not later', async () => {
    let finish: () => void = () => undefined;
    const animations = [css(new Promise<void>((resolve) => (finish = resolve)))];
    const promise = waitForAnimations(elementWith(animations));
    animations.push(css(new Promise(() => undefined)));
    finish();
    expect(await resolved(promise)).toBe(true);
  });
});
