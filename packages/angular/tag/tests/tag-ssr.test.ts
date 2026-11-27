// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './fixtures';

describe('Tag on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders the root with its class and text and no style', async () => {
    const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
    const tags = html.match(/<cck-tag[^>]*>[^<]*<\/cck-tag>/g) ?? [];
    expect(tags).toHaveLength(2);
    expect(tags[0]).toMatch(/^<cck-tag[^>]*class="cck-tag"[^>]*>Paid<\/cck-tag>$/);
    expect(tags[1]).toContain('role="status"');
    for (const markup of tags) expect(markup).not.toContain('style=');
  });
});
