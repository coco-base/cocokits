// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './fixtures';

function element(html: string, id: string): string {
  return new RegExp(`<cck-avatar id="${id}"[^>]*>.*?</cck-avatar>`, 's').exec(html)?.[0] ?? '';
}

describe('Avatar on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof Image).toBe('undefined');
  });

  it('renders the idle state: the image hidden and the fallback shown', async () => {
    const one = element(await renderOnServer(), 'one');
    const image = /<img[^>]*>/.exec(one)?.[0] ?? '';
    expect(image).toContain('cck-avatar__image');
    expect(image).toContain('hidden');
    expect(one).toContain('src="/a.png"');
    const fallback = /<cck-avatar-fallback[^>]*>/.exec(one)?.[0] ?? '';
    expect(fallback).toContain('class="cck-avatar__fallback"');
    expect(fallback).not.toContain('hidden');
  });

  it('renders the fallback hidden when it has a delay, and no delay attribute', async () => {
    const two = element(await renderOnServer(), 'two');
    const fallback = /<cck-avatar-fallback[^>]*>/.exec(two)?.[0] ?? '';
    expect(fallback).toContain('hidden');
    expect(fallback.toLowerCase()).not.toContain('delayms');
    expect(two).not.toMatch(/src="[^"]/);
  });

  it('renders the group and the label with their classes and text', async () => {
    const html = await renderOnServer();
    expect(html).toMatch(/<cck-avatar-group[^>]*class="cck-avatar-group"/);
    expect(html).toMatch(/<cck-avatar-label[^>]*class="cck-avatar-label"/);
    expect(html).toContain('class="cck-avatar-label__name"');
    expect(html).toContain('Ada Lovelace');
    expect(html).toContain('class="cck-avatar-label__description"');
  });
});
