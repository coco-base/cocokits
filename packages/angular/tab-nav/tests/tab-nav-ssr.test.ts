// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './fixtures';

describe('TabNav on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders every part with the active and disabled state already in place', async () => {
    const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
    const nav = /<nav\b[^>]*>/.exec(html)?.[0] ?? '';
    expect(nav).toContain('class="cck-tab-nav"');
    expect(nav).toContain('aria-label="Project"');
    expect(html).toContain('class="cck-tab-nav__list"');
    const links = [...html.matchAll(/<a\b[^>]*>/g)].map((match) => match[0]);
    expect(links).toHaveLength(9);
    expect(links[0]).toContain('aria-current="page"');
    expect(links[0]).toContain('data-active=""');
    expect(links[1]).not.toContain('aria-current');
    expect(links[2]).toContain('aria-disabled="true"');
    expect(links[2]).toContain('tabindex="-1"');
    expect(links[2]).toContain('data-disabled=""');
    expect(links[2]).toContain('href="#settings"');
  });

  describe('with a linked panel', () => {
    const attr = (tag: string, name: string): string | undefined => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];

    it('renders the tablist, the tab links, one tab stop and the panel labelled by the active link', async () => {
      const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
      const links = [...html.matchAll(/<a\b[^>]*>/g)].map((match) => match[0]).slice(3, 6);
      expect(html.match(/role="tablist"/g)).toHaveLength(2);
      expect(links.map((link) => attr(link, 'role'))).toEqual(['tab', 'tab', 'tab']);
      expect(links.map((link) => attr(link, 'aria-selected'))).toEqual(['false', 'true', 'false']);
      expect(links.map((link) => attr(link, 'tabindex'))).toEqual(['-1', '0', '-1']);
      expect(links.map((link) => attr(link, 'aria-controls'))).toEqual(['first-panel', 'first-panel', 'first-panel']);
      for (const link of links) expect(link).not.toContain('aria-current');
      const panel = /<div\b[^>]*id="first-panel"[^>]*>/.exec(html)?.[0] ?? '';
      expect(attr(panel, 'role')).toBe('tabpanel');
      expect(attr(panel, 'tabindex')).toBe('0');
      expect(attr(panel, 'aria-labelledby')).toBe('link-b');
      expect(attr(links[1] ?? '', 'id')).toBe('link-b');
      expect(panel).toContain('cck-tab-nav__panel');
    });

    it('gives the first enabled link the one tab stop and the panel no label while no link is active', async () => {
      const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
      const links = [...html.matchAll(/<a\b[^>]*>/g)].map((match) => match[0]).slice(6, 9);
      expect(links.map((link) => attr(link, 'tabindex'))).toEqual(['-1', '0', '-1']);
      expect(links.map((link) => attr(link, 'aria-selected'))).toEqual(['false', 'false', 'false']);
      const panel = /<div\b[^>]*id="second-panel"[^>]*>/.exec(html)?.[0] ?? '';
      expect(panel).not.toContain('aria-labelledby');
    });
  });

  it('renders the indicator without any variable', async () => {
    const html = await renderOnServer();
    expect(html).toMatch(/<span\b[^>]*class="cck-tab-nav__indicator"[^>]*aria-hidden="true"/);
    expect(html).not.toContain('--active-tab');
  });
});
