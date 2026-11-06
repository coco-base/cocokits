// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { createPresence } from '../index';
import type { PresenceState } from '../index';
import { cssAnimation, type FakeAnimation } from './fixtures';
import { settle } from './helpers';

function setup(animations: () => FakeAnimation[]) {
  const element = document.createElement('div');
  element.getAnimations = (() => animations()) as unknown as HTMLElement['getAnimations'];
  const states: PresenceState[] = [];
  const presence = createPresence({ getElement: () => element, onStateChange: (state) => states.push(state) });
  return { presence, states };
}

function deferred() {
  let finish: () => void = () => undefined;
  let cancel: () => void = () => undefined;
  const finished = new Promise<unknown>((resolve, reject) => {
    finish = () => {
      resolve(undefined);
    };
    cancel = () => {
      reject(new Error('cancelled'));
    };
  });
  return { finish, cancel, ...cssAnimation(finished) };
}

describe('createPresence', () => {
  it('starts unmounted and mounts on open', () => {
    const { presence, states } = setup(() => []);
    expect(presence.state()).toBe('unmounted');
    presence.setOpen(true);
    expect(presence.state()).toBe('mounted');
    expect(states).toEqual(['mounted']);
  });

  it('unmounts at once when no animation runs', () => {
    const { presence, states } = setup(() => []);
    presence.setOpen(true);
    presence.setOpen(false);
    expect(states).toEqual(['mounted', 'exiting', 'unmounted']);
  });

  it('unmounts at once when the element is not rendered', () => {
    const states: PresenceState[] = [];
    const presence = createPresence({ getElement: () => null, onStateChange: (state) => states.push(state) });
    presence.setOpen(true);
    presence.setOpen(false);
    expect(states).toEqual(['mounted', 'exiting', 'unmounted']);
  });

  it('waits for every running animation', async () => {
    const first = deferred();
    const second = deferred();
    const { presence } = setup(() => [first, second]);
    presence.setOpen(true);
    presence.setOpen(false);
    expect(presence.state()).toBe('exiting');
    first.finish();
    await settle();
    expect(presence.state()).toBe('exiting');
    second.finish();
    await settle();
    expect(presence.state()).toBe('unmounted');
  });

  it('counts a cancelled animation as finished', async () => {
    const animation = deferred();
    const { presence } = setup(() => [animation]);
    presence.setOpen(true);
    presence.setOpen(false);
    animation.cancel();
    await settle();
    expect(presence.state()).toBe('unmounted');
  });

  it.each([
    { name: 'an infinite animation', overrides: { effect: { getComputedTiming: () => ({ endTime: Infinity }) } } },
    { name: 'a paused animation', overrides: { playState: 'paused' } },
    { name: 'a finished animation', overrides: { playState: 'finished' } },
  ])('does not wait for $name', ({ overrides }) => {
    const { presence, states } = setup(() => [cssAnimation(new Promise(() => undefined), overrides)]);
    presence.setOpen(true);
    presence.setOpen(false);
    expect(states).toEqual(['mounted', 'exiting', 'unmounted']);
  });

  it('does not wait for a CSS transition or an element.animate() animation (no animation name)', () => {
    const withoutName: FakeAnimation = {
      finished: new Promise(() => undefined),
      playState: 'running',
      effect: { getComputedTiming: () => ({ endTime: 300 }) },
    };
    const { presence, states } = setup(() => [withoutName]);
    presence.setOpen(true);
    presence.setOpen(false);
    expect(states).toEqual(['mounted', 'exiting', 'unmounted']);
  });

  it('waits for the finite running animation among others it ignores', async () => {
    const waited = deferred();
    const ignored = cssAnimation(new Promise(() => undefined), { playState: 'paused' });
    const { presence } = setup(() => [ignored, waited]);
    presence.setOpen(true);
    presence.setOpen(false);
    expect(presence.state()).toBe('exiting');
    waited.finish();
    await settle();
    expect(presence.state()).toBe('unmounted');
  });

  it('cancels the exit when it reopens during the exit', async () => {
    const animation = deferred();
    const { presence, states } = setup(() => [animation]);
    presence.setOpen(true);
    presence.setOpen(false);
    presence.setOpen(true);
    animation.finish();
    await settle();
    expect(presence.state()).toBe('mounted');
    expect(states).toEqual(['mounted', 'exiting', 'mounted']);
  });

  it('does nothing when closing while unmounted', () => {
    const onStateChange = vi.fn();
    const presence = createPresence({ getElement: () => null, onStateChange });
    presence.setOpen(false);
    expect(onStateChange).not.toHaveBeenCalled();
  });

  it('stops after destroy', async () => {
    const animation = deferred();
    const { presence, states } = setup(() => [animation]);
    presence.setOpen(true);
    presence.setOpen(false);
    presence.destroy();
    presence.destroy();
    animation.finish();
    await settle();
    presence.setOpen(true);
    expect(states).toEqual(['mounted', 'exiting']);
  });
});
