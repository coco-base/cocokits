// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './fixtures';

describe('Accordion on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders every part with the open items open and the rest closed and hidden', async () => {
    const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
    const triggers = [...html.matchAll(/<button\b[^>]*class="cck-accordion__trigger"[^>]*>/g)].map((match) => match[0]);
    expect(triggers).toHaveLength(5);
    const expanded = triggers.map((tag) => /aria-expanded="(true|false)"/.exec(tag)?.[1]);
    // Single mode: the last of two start-expanded items stays open, also on the server.
    expect(expanded).toEqual(['false', 'false', 'true', 'true', 'false']);
    expect(triggers[4]).toContain('disabled=""');
    const contents = [...html.matchAll(/<div\b[^>]*role="region"[^>]*>/g)].map((match) => match[0]);
    expect(contents).toHaveLength(5);
    expect(contents.map((tag) => tag.includes('hidden'))).toEqual([true, true, false, false, true]);
    for (const tag of contents) expect(tag).toContain('aria-labelledby="');
    for (const tag of triggers) expect(tag).toContain('aria-controls="');
    expect(html).toContain('<h2');
    expect(html).toContain('<b>Care</b>');
    expect(html).toContain('Shipping body');
  });

  it('writes no size variable and keeps no input attribute on the items', async () => {
    const html = await renderOnServer();
    expect(html).not.toContain('--accordion-content');
    expect(html).not.toMatch(/<div\b[^>]*cck-accordion__item[^>]*\s(label|expanded|disabled|headinglevel)=/i);
  });
});
