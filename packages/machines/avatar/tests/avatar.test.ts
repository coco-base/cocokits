import { describe, expect, it } from 'vitest';
import { avatarAnatomy, avatarMeta, getAvatarProps, watchImageLoadingStatus } from '../index';
import type { AvatarImageLoadingStatus, ImageProbe } from '../index';

class StubImage implements ImageProbe {
  src = '';
  crossOrigin: string | null = null;
  referrerPolicy = '';
  complete = false;
  naturalWidth = 0;
  readonly listeners = new Map<string, Set<() => void>>();
  addEventListener(type: 'load' | 'error', listener: () => void): void {
    const set = this.listeners.get(type) ?? new Set<() => void>();
    set.add(listener);
    this.listeners.set(type, set);
  }
  removeEventListener(type: 'load' | 'error', listener: () => void): void {
    this.listeners.get(type)?.delete(listener);
  }
  fire(type: 'load' | 'error'): void {
    [...(this.listeners.get(type) ?? [])].forEach((listener) => {
      listener();
    });
  }
  count(): number {
    return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0);
  }
}

function watch(input: Parameters<typeof watchImageLoadingStatus>[0], image = new StubImage()) {
  const seen: AvatarImageLoadingStatus[] = [];
  const stop = watchImageLoadingStatus(
    input,
    (status) => seen.push(status),
    () => image,
  );
  return { seen, stop, image };
}

describe('getAvatarProps', () => {
  it('has the block, image and fallback classes', () => {
    expect(avatarAnatomy.classes).toEqual({
      root: 'cck-avatar',
      image: 'cck-avatar__image',
      fallback: 'cck-avatar__fallback',
    });
  });

  it.each<[AvatarImageLoadingStatus, boolean | undefined, boolean, boolean]>([
    ['idle', undefined, true, false],
    ['loading', undefined, true, false],
    ['error', undefined, true, false],
    ['loaded', undefined, false, true],
    ['idle', true, true, false],
    ['error', true, true, false],
    ['idle', false, true, true],
    ['loading', false, true, true],
    ['error', false, true, true],
    ['loaded', false, false, true],
    ['loaded', true, false, true],
  ])(
    'status %s, delayPassed %s: image hidden %s, fallback hidden %s',
    (status, delayPassed, imageHidden, fallbackHidden) => {
      const parts = getAvatarProps({ status, delayPassed });
      expect(parts.root).toEqual({ class: 'cck-avatar' });
      expect('hidden' in parts.image).toBe(imageHidden);
      expect('hidden' in parts.fallback).toBe(fallbackHidden);
      if (imageHidden) expect(parts.image.hidden).toBe(true);
      if (fallbackHidden) expect(parts.fallback.hidden).toBe(true);
    },
  );

  it('is pure: equal input gives equal output', () => {
    expect(getAvatarProps({ status: 'loading', delayPassed: false })).toEqual(
      getAvatarProps({ status: 'loading', delayPassed: false }),
    );
  });
});

describe('watchImageLoadingStatus', () => {
  it.each([undefined, null, ''])('reports error for src %j without creating an image', (src) => {
    let created = 0;
    const seen: AvatarImageLoadingStatus[] = [];
    const stop = watchImageLoadingStatus(
      { src },
      (s) => seen.push(s),
      () => {
        created += 1;
        return new StubImage();
      },
    );
    expect(seen).toEqual(['error']);
    expect(created).toBe(0);
    expect(stop).not.toThrow();
  });

  it('reports loaded for a complete image with a width', () => {
    const image = new StubImage();
    image.complete = true;
    image.naturalWidth = 40;
    const { seen, image: probe } = watch({ src: 'a.png' }, image);
    expect(seen).toEqual(['loaded']);
    expect(probe.src).toBe('a.png');
  });

  it('reports error for a complete image without a width', () => {
    const image = new StubImage();
    image.complete = true;
    expect(watch({ src: 'a.png' }, image).seen).toEqual(['error']);
  });

  it('reports loading, then loaded on load', () => {
    const { seen, image } = watch({ src: 'a.png' });
    expect(seen).toEqual(['loading']);
    image.fire('load');
    expect(seen).toEqual(['loading', 'loaded']);
  });

  it('reports loading, then error on error', () => {
    const { seen, image } = watch({ src: 'a.png' });
    image.fire('error');
    expect(seen).toEqual(['loading', 'error']);
  });

  it('stop removes the listeners, so a late event reports nothing', () => {
    const { seen, stop, image } = watch({ src: 'a.png' });
    expect(image.count()).toBe(2);
    stop();
    expect(image.count()).toBe(0);
    image.fire('load');
    image.fire('error');
    expect(seen).toEqual(['loading']);
  });

  it('a new source replaces the status directly, with no idle between', () => {
    const seen: AvatarImageLoadingStatus[] = [];
    const first = new StubImage();
    const second = new StubImage();
    const stop = watchImageLoadingStatus(
      { src: 'a.png' },
      (s) => seen.push(s),
      () => first,
    );
    first.fire('load');
    stop();
    watchImageLoadingStatus(
      { src: 'b.png' },
      (s) => seen.push(s),
      () => second,
    );
    second.fire('error');
    expect(seen).toEqual(['loading', 'loaded', 'loading', 'error']);
    expect(seen).not.toContain('idle');
  });

  it('copies crossOrigin and referrerPolicy to the probe, and leaves them alone when unset', () => {
    expect(watch({ src: 'a.png', crossOrigin: 'anonymous', referrerPolicy: 'no-referrer' }).image).toMatchObject({
      crossOrigin: 'anonymous',
      referrerPolicy: 'no-referrer',
    });
    expect(watch({ src: 'a.png' }).image).toMatchObject({ crossOrigin: null, referrerPolicy: '' });
  });

  it('uses new Image() by default', () => {
    const created: unknown[] = [];
    class FakeImage extends StubImage {
      constructor() {
        super();
        created.push(this);
      }
    }
    const original = globalThis.Image;
    globalThis.Image = FakeImage as unknown as typeof Image;
    try {
      watchImageLoadingStatus({ src: 'a.png' }, () => undefined);
    } finally {
      globalThis.Image = original;
    }
    expect(created).toHaveLength(1);
  });
});

describe('avatarMeta', () => {
  it('lists no data attribute, no role and no key, and the element of each part', () => {
    expect(avatarMeta.dataAttrs).toEqual({ root: [], image: [], fallback: [] });
    expect(avatarMeta.roles).toEqual({ root: null, image: null, fallback: null });
    expect(avatarMeta.keyboard).toEqual([]);
    expect(avatarMeta.apg).toBeUndefined();
    expect(avatarMeta.defaultElements).toEqual({ root: 'span', image: 'img', fallback: 'span' });
  });
});
