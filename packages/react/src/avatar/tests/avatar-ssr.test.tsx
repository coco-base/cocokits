// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Avatar } from '../index';

describe('Avatar on the server', () => {
  it('imports in plain Node without window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    expect(typeof Avatar.Root).toBe('function');
  });

  it('renders the idle markup: image hidden, fallback shown, no inline style', () => {
    const html = renderToString(
      <Avatar.Root>
        <Avatar.Image src="/ada.webp" alt="Ada Park" />
        <Avatar.Fallback>AP</Avatar.Fallback>
      </Avatar.Root>,
    );
    // React 19 adds a preload link for the image before the markup.
    expect(html).toContain('<span class="cck-avatar"><img class="cck-avatar__image" hidden=""');
    expect(html).toContain('<span class="cck-avatar__fallback">AP</span></span>');
    expect(html).not.toContain('style=');
  });

  it('renders the fallback hidden with delayMs', () => {
    const html = renderToString(
      <Avatar.Root>
        <Avatar.Fallback delayMs={600}>AP</Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(html).toContain('<span class="cck-avatar__fallback" hidden="">AP</span>');
  });

  it('never calls onLoadingStatusChange', () => {
    const seen: string[] = [];
    renderToString(
      <Avatar.Root>
        <Avatar.Image src="/ada.webp" alt="" onLoadingStatusChange={(status) => seen.push(status)} />
      </Avatar.Root>,
    );
    expect(seen).toEqual([]);
  });
});
