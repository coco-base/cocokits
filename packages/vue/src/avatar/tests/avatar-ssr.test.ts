// @vitest-environment node
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { AvatarGroup } from '../../avatar-group';
import { AvatarLabel } from '../../avatar-label';
import { AvatarFallback, AvatarImage, AvatarRoot } from '../index';
import { view } from './fixtures';

// Fragment markers of the slots are left out, so the assertions read the elements only.
const render = async (make: Parameters<typeof view>[0]): Promise<string> =>
  (await renderToString(createSSRApp(view(make)))).replace(/<!--.*?-->/g, '');

describe('Avatar on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders status idle: the image hidden and the fallback shown, with no inline style', async () => {
    const html = await render(() =>
      h(AvatarRoot, null, () => [h(AvatarImage, { src: '/a.webp', alt: 'Ada' }), h(AvatarFallback, null, () => 'AL')]),
    );
    expect(html).toContain('<span class="cck-avatar">');
    expect(html).toMatch(/<img[^>]*class="cck-avatar__image"[^>]*hidden/);
    expect(html).toContain('src="/a.webp"');
    expect(html).toContain('alt="Ada"');
    expect(html).toContain('<span class="cck-avatar__fallback">AL</span>');
    expect(html).not.toContain('style=');
    expect(html).not.toContain('id=');
  });

  it('renders the fallback hidden with delayMs', async () => {
    const html = await render(() => h(AvatarRoot, null, () => h(AvatarFallback, { delayMs: 200 }, () => 'AL')));
    expect(html).toMatch(/<span[^>]*class="cck-avatar__fallback"[^>]*hidden/);
  });

  it('renders the group and the label parts in order', async () => {
    const html = await render(() => [
      h(AvatarGroup, null, () => [h(AvatarRoot), h(AvatarRoot)]),
      h(AvatarLabel, { name: 'Ada', description: 'Maths' }, () => h(AvatarRoot)),
      h(AvatarLabel, { description: 'Only' }),
      h(AvatarLabel),
    ]);
    expect(html).toContain(
      '<div class="cck-avatar-group"><span class="cck-avatar"></span><span class="cck-avatar"></span></div>',
    );
    expect(html).toContain(
      '<div class="cck-avatar-label"><span class="cck-avatar"></span><span class="cck-avatar-label__text"><span class="cck-avatar-label__name">Ada</span><span class="cck-avatar-label__description">Maths</span></span></div>',
    );
    expect(html).toContain(
      '<span class="cck-avatar-label__text"><span class="cck-avatar-label__description">Only</span></span>',
    );
    expect(html).toContain('<div class="cck-avatar-label"></div>');
  });
});
