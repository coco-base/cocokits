// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './fixtures';

describe('Badge on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders the parts and data-* in the markup', async () => {
    const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
    expect(html).toMatch(
      /<cck-badge[^>]*class="cck-badge"[^>]*><span class="cck-badge__content">5<\/span><\/cck-badge>/,
    );
    expect(html).toMatch(/<cck-badge[^>]*data-empty=""[^>]*>/);
    expect(html).toMatch(
      /data-truncated=""[^>]*><span class="cck-badge__content">99<\/span><span class="cck-badge__max-indicator">\+<\/span>/,
    );
    expect(html).toMatch(/<cck-badge[^>]*hidden=""[^>]*><\/cck-badge>/);
  });

  it('renders the container and its badge without any style', async () => {
    const html = await renderOnServer();
    const container = /<cck-badge-container[^>]*>/.exec(html)?.[0] ?? '';
    expect(container).toContain('data-position="bottom-left"');
    expect(container).not.toContain('style=');
  });
});
