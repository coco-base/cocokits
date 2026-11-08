// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { renderOnServer } from './fixtures';

/** The attribute `name` of a tag string, or `undefined`. */
function attr(tag: string, name: string): string | undefined {
  return new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];
}

describe('Tabs on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
  });

  it('renders every part with the selected tab, the tab stop and the hidden panels already in place', async () => {
    const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
    const tabs = [...html.matchAll(/<button\b[^>]*role="tab"[^>]*>/g)].map((match) => match[0]);
    expect(tabs).toHaveLength(7);
    expect(tabs[0]).toContain('aria-selected="false"');
    expect(tabs[0]).toContain('tabindex="-1"');
    expect(tabs[1]).toContain('aria-selected="true"');
    expect(tabs[1]).toContain('tabindex="0"');
    expect(tabs[1]).toContain('data-selected=""');
    // No index given: a disabled first tab is skipped, the first enabled tab is selected.
    expect(tabs[3]).toContain('disabled=""');
    expect(tabs[3]).toContain('aria-selected="false"');
    expect(tabs[4]).toContain('aria-selected="true"');
    expect(html).toContain('aria-orientation="vertical"');
    const panels = [...html.matchAll(/<cck-tab\b[^>]*role="tabpanel"[^>]*>/g)].map((match) => match[0]);
    expect(panels).toHaveLength(7);
    expect(panels[0]).toContain('hidden');
    expect(panels[1]).not.toContain('hidden');
    expect(html).toContain('<b>Y</b>');
  });

  it('renders the content of the selected panel only, and kept content only once selected', async () => {
    const html = await renderOnServer();
    expect(html).toContain('Password body');
    expect(html).not.toContain('Account body');
    expect(html).not.toContain('Locked body');
    expect(html).not.toContain('X body');
    expect(html).toContain('Y body');
    expect(html).toContain('Second body');
    expect(html).not.toContain('First body');
  });

  it('resolves every aria-controls and aria-labelledby inside the same html, also with a tab id', async () => {
    const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
    const ids = new Set([...html.matchAll(/\sid="([^"]*)"/g)].map((match) => match[1]));
    const tabs = [...html.matchAll(/<button\b[^>]*role="tab"[^>]*>/g)].map((match) => match[0]);
    const panels = [...html.matchAll(/<cck-tab\b[^>]*role="tabpanel"[^>]*>/g)].map((match) => match[0]);
    for (const tab of tabs) expect(ids.has(attr(tab, 'aria-controls') ?? ''), tab).toBe(true);
    for (const panel of panels) expect(ids.has(attr(panel, 'aria-labelledby') ?? ''), panel).toBe(true);
    expect(attr(tabs[1] ?? '', 'id')).toBe('password-tab');
    expect(attr(panels[1] ?? '', 'aria-labelledby')).toBe('password-tab');
    expect(attr(tabs[2] ?? '', 'aria-label')).toBe('Locked tab');
  });

  it('writes no indicator variable and keeps no label, disabled or aria-label attribute on the sections', async () => {
    const html = await renderOnServer();
    expect(html).not.toContain('--active-tab');
    expect(html).toContain('class="cck-tabs__indicator"');
    expect(html).not.toMatch(/<div\b[^>]*cck-tabs__panel[^>]*\s(label|disabled|aria-label)=/);
    expect(html).not.toMatch(/<div\b[^>]*class="cck-tabs"[^>]*aria-label=/);
  });
});
