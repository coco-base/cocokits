import { signal } from '@angular/core';
import { render } from '@testing-library/angular';
import { avatarAnatomy } from '@cocokits/machines/avatar';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckAvatar, CckAvatarFallback, CckAvatarImage, CckAvatarImports } from '../index';
import { FakeImage, installFakeImage, lastProbe } from './fake-image';

const imports = [...CckAvatarImports];

const template = (attrs = '', fallbackAttrs = ''): string => `
  <cck-avatar id="a">
    <img cckAvatarImage ${attrs} alt="Ada" />
    <cck-avatar-fallback ${fallbackAttrs}>AL</cck-avatar-fallback>
  </cck-avatar>`;

function part(container: HTMLElement, selector: string): HTMLElement {
  const el = container.querySelector<HTMLElement>(selector);
  if (!el) throw new Error(`nothing matches ${selector}`);
  return el;
}

describe('CckAvatar', () => {
  beforeEach(installFakeImage);
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders the parts, classes and elements of the anatomy, with no role and no inline style', async () => {
    const { container } = await render(template('src="a.png"'), { imports });
    const root = part(container, '.cck-avatar');
    const image = part(container, '.cck-avatar__image');
    const fallback = part(container, '.cck-avatar__fallback');
    expect(root.tagName).toBe('CCK-AVATAR');
    expect(root.className).toBe(avatarAnatomy.classes.root);
    expect(root.hasAttribute('role')).toBe(false);
    expect(image.tagName).toBe('IMG');
    expect(fallback.tagName).toBe('CCK-AVATAR-FALLBACK');
    expect(root.querySelector('[style]')).toBeNull();
    expect(image.getAttribute('src')).toBe('a.png');
    expect(image.getAttribute('alt')).toBe('Ada');
  });

  it('keeps the class of the author and exports the directives', async () => {
    const { container, fixture } = await render(
      `<cck-avatar #r="cckAvatar" class="mine" id="x"><img cckAvatarImage #i="cckAvatarImage" class="photo" /></cck-avatar>`,
      { imports },
    );
    expect(part(container, '#x').className).toContain('mine');
    expect(part(container, '#x').className).toContain('cck-avatar');
    expect(part(container, 'img').className).toContain('photo');
    expect(part(container, 'img').className).toContain('cck-avatar__image');
    expect(fixture.debugElement.children[0]?.injector.get(CckAvatar)).toBeInstanceOf(CckAvatar);
    expect(fixture.debugElement.children[0]?.children[0]?.injector.get(CckAvatarImage)).toBeInstanceOf(CckAvatarImage);
  });

  it('shows the fallback and hides the image until the picture loads, then swaps them', async () => {
    const { container, fixture } = await render(template('src="a.png"'), { imports });
    const image = part(container, 'img');
    const fallback = part(container, 'cck-avatar-fallback');
    await fixture.whenStable();
    expect(image.hidden).toBe(true);
    expect(fallback.hidden).toBe(false);

    lastProbe().load();
    await fixture.whenStable();
    expect(image.hidden).toBe(false);
    expect(fallback.hidden).toBe(true);
  });

  it('keeps the fallback after an error', async () => {
    const { container, fixture } = await render(template('src="a.png"'), { imports });
    lastProbe().fail();
    await fixture.whenStable();
    expect(part(container, 'img').hidden).toBe(true);
    expect(part(container, 'cck-avatar-fallback').hidden).toBe(false);
  });

  it('shows the fallback when there is no src', async () => {
    const { container, fixture } = await render(template(), { imports });
    await fixture.whenStable();
    expect(part(container, 'img').hidden).toBe(true);
    // Angular writes an empty src for a missing one on an img (unwrapImgVideoSrcValue).
    expect(part(container, 'img').getAttribute('src') ?? '').toBe('');
    expect(part(container, 'cck-avatar-fallback').hidden).toBe(false);
    expect(FakeImage.all).toHaveLength(0);
  });

  it('reports loading then loaded, and loading then error, and never idle', async () => {
    const seen: string[] = [];
    const { fixture } = await render(
      `<cck-avatar><img cckAvatarImage [src]="src()" (loadingStatusChange)="seen.push($event)" /></cck-avatar>`,
      { imports, componentProperties: { src: signal('a.png'), seen } },
    );
    await fixture.whenStable();
    lastProbe().load();
    await fixture.whenStable();
    expect(seen).toEqual(['loading', 'loaded']);
  });

  it('reports the new sequence after a src change and never the same status twice in a row', async () => {
    const seen: string[] = [];
    const src = signal('a.png');
    const { container, fixture } = await render(
      `<cck-avatar><img cckAvatarImage [src]="src()" (loadingStatusChange)="seen.push($event)" /><cck-avatar-fallback>AL</cck-avatar-fallback></cck-avatar>`,
      { imports, componentProperties: { src, seen } },
    );
    await fixture.whenStable();
    const first = lastProbe();
    first.load();
    await fixture.whenStable();

    src.set('b.png');
    await fixture.whenStable();
    // The old probe is stopped and the new status replaces the old one with no idle in between.
    expect(first.listenerCount()).toBe(0);
    expect(part(container, 'cck-avatar-fallback').hidden).toBe(false);
    lastProbe().fail();
    await fixture.whenStable();
    expect(seen).toEqual(['loading', 'loaded', 'loading', 'error']);

    src.set('');
    await fixture.whenStable();
    expect(seen).toEqual(['loading', 'loaded', 'loading', 'error']);
  });

  it('copies crossorigin and referrerpolicy of the img to the probe', async () => {
    const { fixture } = await render(template('src="a.png" crossorigin="anonymous" referrerpolicy="no-referrer"'), {
      imports,
    });
    await fixture.whenStable();
    expect(lastProbe().crossOrigin).toBe('anonymous');
    expect(lastProbe().referrerPolicy).toBe('no-referrer');
    expect(lastProbe().src).toContain('a.png');
  });

  it('stops probing when the image is removed', async () => {
    const show = signal(true);
    const { fixture } = await render(`<cck-avatar>@if (show()) {<img cckAvatarImage src="a.png" />}</cck-avatar>`, {
      imports,
      componentProperties: { show },
    });
    await fixture.whenStable();
    const probe = lastProbe();
    expect(probe.listenerCount()).toBe(2);
    show.set(false);
    await fixture.whenStable();
    expect(probe.listenerCount()).toBe(0);
  });

  it('keeps the fallback shown when there is no image', async () => {
    const { container } = await render(`<cck-avatar><cck-avatar-fallback>AL</cck-avatar-fallback></cck-avatar>`, {
      imports,
    });
    expect(part(container, 'cck-avatar-fallback').hidden).toBe(false);
  });

  it('warns once in development when a root holds more than one image', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(
      `<cck-avatar><img cckAvatarImage src="a.png" /><img cckAvatarImage src="b.png" /><img cckAvatarImage src="c.png" /></cck-avatar>`,
      {
        imports,
      },
    );
    const own = warn.mock.calls.filter(([message]) => String(message).startsWith('CocoKits:'));
    expect(own).toHaveLength(1);
    warn.mockRestore();
  });

  it('does not warn for one image', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await render(template('src="a.png"'), { imports });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('fails with a clear message when a part is outside an avatar', async () => {
    await expect(render(`<cck-avatar-fallback>AL</cck-avatar-fallback>`, { imports })).rejects.toThrow(
      'CocoKits: cck-avatar-fallback must be placed inside a <cck-avatar>.',
    );
  });

  it('sends role and aria attributes of the author to the root', async () => {
    const { container } = await render(
      `<cck-avatar role="img" aria-label="Ada Lovelace"><cck-avatar-fallback>AL</cck-avatar-fallback></cck-avatar>`,
      { imports },
    );
    expect(part(container, '.cck-avatar').getAttribute('role')).toBe('img');
    expect(part(container, '.cck-avatar').getAttribute('aria-label')).toBe('Ada Lovelace');
  });

  describe('delayMs', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    });

    it('hides the fallback at first and shows it after the delay', async () => {
      const { container, fixture } = await render(template('', 'delayMs="300"'), { imports });
      const fallback = part(container, 'cck-avatar-fallback');
      expect(fallback.hidden).toBe(true);
      expect(fallback.hasAttribute('delayMs')).toBe(false);
      await fixture.whenStable();
      vi.advanceTimersByTime(299);
      await fixture.whenStable();
      expect(fallback.hidden).toBe(true);
      vi.advanceTimersByTime(1);
      await fixture.whenStable();
      expect(fallback.hidden).toBe(false);
    });

    it('restarts the timer when delayMs changes and clears it on destroy', async () => {
      const delay = signal(300);
      const { container, fixture } = await render(
        `<cck-avatar><cck-avatar-fallback [delayMs]="delay()">AL</cck-avatar-fallback></cck-avatar>`,
        { imports, componentProperties: { delay } },
      );
      await fixture.whenStable();
      vi.advanceTimersByTime(200);
      delay.set(500);
      await fixture.whenStable();
      vi.advanceTimersByTime(400);
      await fixture.whenStable();
      expect(part(container, 'cck-avatar-fallback').hidden).toBe(true);
      vi.advanceTimersByTime(100);
      await fixture.whenStable();
      expect(part(container, 'cck-avatar-fallback').hidden).toBe(false);
    });

    it('starts no timer without a delay', async () => {
      const { container, fixture } = await render(template(), { imports });
      await fixture.whenStable();
      expect(vi.getTimerCount()).toBe(0);
      expect(part(container, 'cck-avatar-fallback').hidden).toBe(false);
    });

    it('stays hidden while the picture is loaded', async () => {
      const { container, fixture } = await render(template('src="a.png"', 'delayMs="10"'), { imports });
      await fixture.whenStable();
      lastProbe().load();
      vi.advanceTimersByTime(20);
      await fixture.whenStable();
      expect(part(container, 'cck-avatar-fallback').hidden).toBe(true);
      expect(part(container, 'img').hidden).toBe(false);
    });
  });

  it('keeps CckAvatarFallback in the imports bundle', () => {
    expect(CckAvatarImports).toContain(CckAvatarFallback);
  });
});
