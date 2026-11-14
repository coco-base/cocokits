// @vitest-environment jsdom
import { cleanup } from '@testing-library/vue';
import { h, nextTick, ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { avatarMeta } from '@cocokits/machines/avatar';
import { defineThemeConfig } from '@cocokits/shared';
import { ThemeProvider } from '@cocokits/vue-core';
import { AvatarFallback, AvatarImage, AvatarRoot, type AvatarImageLoadingStatus } from '../index';
import { mountView, pick, stubImage, StubImage } from './fixtures';

beforeEach(stubImage);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const avatar = (src: string | undefined, onStatus?: (status: AvatarImageLoadingStatus) => void) => () =>
  h(AvatarRoot, null, () => [
    h(AvatarImage, { src, alt: 'Ada', onLoadingStatusChange: onStatus }),
    h(AvatarFallback, null, () => 'AL'),
  ]);

describe('Avatar (rendered contract)', () => {
  it('renders a span root, a hidden img and a shown fallback while the image is not loaded', () => {
    const { container } = mountView(avatar('/a.webp'));
    const root = pick(container, '.cck-avatar');
    expect(root.tagName).toBe('SPAN');
    expect(root.hasAttribute('role')).toBe(false);
    const image = pick(container, '.cck-avatar__image');
    expect(image.tagName).toBe('IMG');
    expect(image.getAttribute('src')).toBe('/a.webp');
    expect(image.getAttribute('alt')).toBe('Ada');
    expect(image.hidden).toBe(true);
    const fallback = pick(container, '.cck-avatar__fallback');
    expect(fallback.tagName).toBe('SPAN');
    expect(fallback.hidden).toBe(false);
    expect(fallback.textContent).toBe('AL');
  });

  it('shows the image and hides the fallback once the image has loaded', async () => {
    const { container } = mountView(avatar('/a.webp'));
    StubImage.last.fire('load');
    await nextTick();
    expect(pick(container, '.cck-avatar__image').hidden).toBe(false);
    expect(pick(container, '.cck-avatar__fallback').hidden).toBe(true);
  });

  it('keeps the fallback and hides the image after an error or without a src', async () => {
    const { container } = mountView(avatar('/a.webp'));
    StubImage.last.fire('error');
    await nextTick();
    expect(pick(container, '.cck-avatar__image').hidden).toBe(true);
    expect(pick(container, '.cck-avatar__fallback').hidden).toBe(false);
    cleanup();
    const second = mountView(avatar(undefined));
    await nextTick();
    expect(pick(second.container, '.cck-avatar__fallback').hidden).toBe(false);
  });

  it('copies crossOrigin and referrerPolicy to the img and the probe', () => {
    const { container } = mountView(() =>
      h(AvatarRoot, null, () =>
        h(AvatarImage, { src: '/a.webp', crossOrigin: 'anonymous', referrerPolicy: 'no-referrer' }),
      ),
    );
    const image = pick(container, '.cck-avatar__image');
    expect(image.getAttribute('crossorigin')).toBe('anonymous');
    expect(image.getAttribute('referrerpolicy')).toBe('no-referrer');
    expect(StubImage.last.crossOrigin).toBe('anonymous');
    expect(StubImage.last.referrerPolicy).toBe('no-referrer');
  });

  it('lets native attributes, a merged class and the root attributes through', () => {
    const { container } = mountView(() =>
      h(AvatarRoot, { id: 'root', class: 'mine', role: 'img', 'aria-label': 'Ada' }, () => [
        h(AvatarImage, { src: '/a.webp', id: 'pic', class: 'pic', loading: 'lazy' }),
        h(AvatarFallback, { id: 'fb' }, () => 'AL'),
      ]),
    );
    const root = pick(container, '.cck-avatar');
    expect(root.className).toBe('mine cck-avatar');
    expect(root.id).toBe('root');
    expect(root.getAttribute('role')).toBe('img');
    expect(pick(container, '.cck-avatar__image').className).toContain('pic');
    expect(pick(container, '.cck-avatar__image').getAttribute('loading')).toBe('lazy');
    expect(pick(container, '.cck-avatar__fallback').id).toBe('fb');
  });

  it('renders the root with as and exposes the elements', () => {
    const root = ref<{ element: Element | null } | null>(null);
    const image = ref<{ element: HTMLImageElement | null } | null>(null);
    const { container } = mountView(() =>
      h(AvatarRoot, { ref: root, as: 'div' }, () => h(AvatarImage, { ref: image, src: '/a.webp' })),
    );
    expect(pick(container, '.cck-avatar').tagName).toBe('DIV');
    expect(root.value?.element).toBe(pick(container, '.cck-avatar'));
    expect(image.value?.element).toBe(pick(container, '.cck-avatar__image'));
  });

  it('merges the fallback onto its child with asChild and keeps hidden', async () => {
    const { container } = mountView(() =>
      h(AvatarRoot, null, () => [
        h(AvatarImage, { src: '/a.webp' }),
        h(AvatarFallback, { asChild: true }, () => h('em', null, 'AL')),
      ]),
    );
    expect(pick(container, '.cck-avatar__fallback').tagName).toBe('EM');
    StubImage.last.fire('load');
    await nextTick();
    expect(pick(container, '.cck-avatar__fallback').hidden).toBe(true);
  });

  it('emits only the data-* the meta declares, and the theme attributes', () => {
    const config = defineThemeConfig({
      name: 'test',
      components: { avatar: { size: { attrName: 'size', values: ['sm', 'md'], default: 'md' } } },
    });
    const { container } = mountView(() => h(ThemeProvider, { themeConfig: config }, avatar('/a.webp')));
    const root = pick(container, '.cck-avatar');
    expect(root.getAttribute('data-size')).toBe('md');
    for (const element of container.querySelectorAll('[class^="cck-avatar"]')) {
      expect(element.getAttributeNames().filter((name) => name.startsWith('data-') && name !== 'data-size')).toEqual(
        [],
      );
    }
    expect(Object.values(avatarMeta.dataAttrs).flat()).toEqual([]);
  });
});

describe('Avatar loading status', () => {
  it('reports loading then loaded, never idle', () => {
    const seen: AvatarImageLoadingStatus[] = [];
    mountView(avatar('/a.webp', (status) => seen.push(status)));
    expect(seen).toEqual(['loading']);
    StubImage.last.fire('load');
    expect(seen).toEqual(['loading', 'loaded']);
  });

  it('reports loading then error for a failing source', () => {
    const seen: AvatarImageLoadingStatus[] = [];
    mountView(avatar('/a.webp', (status) => seen.push(status)));
    StubImage.last.fire('error');
    expect(seen).toEqual(['loading', 'error']);
  });

  it('reports error once without a src', () => {
    const seen: AvatarImageLoadingStatus[] = [];
    mountView(avatar(undefined, (status) => seen.push(status)));
    expect(seen).toEqual(['error']);
  });

  it('reports the next sequence after a src change, with no idle and no repeat', async () => {
    const src = ref('/a.webp');
    const seen: AvatarImageLoadingStatus[] = [];
    const { container } = mountView(() => avatar(src.value, (status) => seen.push(status))());
    StubImage.last.fire('load');
    src.value = '/b.webp';
    await nextTick();
    expect(StubImage.last.src).toBe('/b.webp');
    // The old status is replaced directly: the image is hidden while the new one loads.
    expect(pick(container, '.cck-avatar__image').hidden).toBe(true);
    StubImage.last.fire('error');
    expect(seen).toEqual(['loading', 'loaded', 'loading', 'error']);
  });

  it('removes the listeners of the probe on a change and on unmount', async () => {
    const src = ref('/a.webp');
    const rendered = mountView(() => avatar(src.value)());
    const first = StubImage.last;
    expect(first.listenerCount).toBe(2);
    src.value = '/b.webp';
    await nextTick();
    expect(first.listenerCount).toBe(0);
    const second = StubImage.last;
    rendered.unmount();
    expect(second.listenerCount).toBe(0);
  });

  it('logs one warning for a second image in one root and none for one', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mountView(avatar('/a.webp'));
    expect(warn).not.toHaveBeenCalled();
    cleanup();
    mountView(() =>
      h(AvatarRoot, null, () => [h(AvatarImage, { src: '/a.webp' }), h(AvatarImage, { src: '/b.webp' })]),
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain('CocoKits:');
    expect(warn.mock.calls[0]?.[0]).toContain('AvatarRoot');
  });

  it('throws when a part is used outside an AvatarRoot', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(() => mountView(() => h(AvatarImage, { src: '/a.webp' }))).toThrow(
      '<AvatarImage> must be used inside <AvatarRoot>',
    );
    expect(() => mountView(() => h(AvatarFallback))).toThrow('<AvatarFallback> must be used inside <AvatarRoot>');
  });
});

describe('Avatar fallback delay', () => {
  it('is hidden at first and shows after delayMs', async () => {
    vi.useFakeTimers();
    const { container } = mountView(() =>
      h(AvatarRoot, null, () => [h(AvatarImage, { src: '/a.webp' }), h(AvatarFallback, { delayMs: 300 }, () => 'AL')]),
    );
    const fallback = pick(container, '.cck-avatar__fallback');
    expect(fallback.hidden).toBe(true);
    await vi.advanceTimersByTimeAsync(299);
    expect(fallback.hidden).toBe(true);
    await vi.advanceTimersByTimeAsync(1);
    expect(fallback.hidden).toBe(false);
  });

  it('restarts the wait when delayMs changes and clears the timer on unmount', async () => {
    vi.useFakeTimers();
    const delay = ref(300);
    const rendered = mountView(() =>
      h(AvatarRoot, null, () => [h(AvatarImage), h(AvatarFallback, { delayMs: delay.value }, () => 'AL')]),
    );
    await vi.advanceTimersByTimeAsync(200);
    delay.value = 500;
    await nextTick();
    await vi.advanceTimersByTimeAsync(400);
    expect(pick(rendered.container, '.cck-avatar__fallback').hidden).toBe(true);
    await vi.advanceTimersByTimeAsync(100);
    expect(pick(rendered.container, '.cck-avatar__fallback').hidden).toBe(false);
    delay.value = 100;
    await nextTick();
    rendered.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('shows at once without delayMs', () => {
    const { container } = mountView(avatar('/a.webp'));
    expect(pick(container, '.cck-avatar__fallback').hidden).toBe(false);
  });
});
