// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './chip-ssr-fixtures';

describe('Chip on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders the chips, their ids and the remove buttons named by the content', async () => {
    const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
    expect(html).toContain('class="cck-chip"');
    expect(html).toContain('id="removable-content"');
    expect(html).toMatch(/<button[^>]*aria-labelledby="removable-content"/);
    expect(html).toMatch(/<button[^>]*type="button"[^>]*disabled=""/);
  });

  it('gives every chip id and content id once, and every reference resolves', async () => {
    const html = await renderOnServer();
    const ids = [...html.matchAll(/\sid="([^"]*)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
    for (const [, reference] of html.matchAll(/\saria-labelledby="([^"]*)"/g)) expect(ids).toContain(reference);
  });
});
