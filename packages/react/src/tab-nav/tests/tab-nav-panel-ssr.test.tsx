// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PanelExample } from './panel-fixtures';

const links = (html: string): string[] => [...html.matchAll(/<a\b[^>]*>/g)].map((match) => match[0]);
const tabStops = (html: string): number => links(html).filter((link) => link.includes('tabindex="0"')).length;
const panel = (html: string): string => /<div\b[^>]*role="tabpanel"[^>]*>/.exec(html)?.[0] ?? '';

describe('TabNav panel mode on the server', () => {
  it('renders the tab roles, the list as tablist and the panel as tabpanel', () => {
    const html = renderToString(<PanelExample />);
    expect(html).toMatch(/<div\b[^>]*role="tablist"/);
    expect(html).not.toContain('aria-current');
    links(html).forEach((link) => {
      expect(link).toContain('role="tab"');
      expect(link).toContain('aria-controls="routed"');
    });
    expect(links(html)[1]).toContain('aria-selected="true"');
    expect(links(html)[0]).toContain('aria-selected="false"');
    expect(panel(html)).toContain('id="routed"');
    expect(panel(html)).toContain('tabindex="0"');
  });

  it.each([
    ['the second link', 'activity', 1],
    ['the first link', 'overview', 0],
    ['the last link', 'settings', 2],
  ] as const)(
    'has exactly one tab stop, %s, when it is active, and the panel resolves to it',
    (_name, active, index) => {
      const html = renderToString(<PanelExample active={active} />);
      expect(tabStops(html)).toBe(1);
      expect(links(html)[index]).toContain('tabindex="0"');
      const label = /aria-labelledby="([^"]+)"/.exec(panel(html))?.[1];
      expect(label).toBeTruthy();
      expect(links(html)[index]).toContain(`id="${String(label)}"`);
    },
  );

  it('gives the tab stop to the first enabled link when none is active, and no label to the panel', () => {
    const html = renderToString(<PanelExample active={null} />);
    expect(tabStops(html)).toBe(1);
    expect(links(html)[0]).toContain('tabindex="0"');
    expect(panel(html)).not.toContain('aria-labelledby');
  });

  it('skips a disabled first link for the tab stop', () => {
    const html = renderToString(<PanelExample active={null} lockOverview />);
    expect(tabStops(html)).toBe(1);
    expect(links(html)[0]).toContain('tabindex="-1"');
    expect(links(html)[1]).toContain('tabindex="0"');
  });

  it('renders the same without Strict Mode and with the panel before the nav', () => {
    const strict = renderToString(<PanelExample active="settings" />);
    const plain = renderToString(<PanelExample active="settings" strict={false} />);
    expect(tabStops(plain)).toBe(1);
    expect(plain).toBe(strict);
    const before = renderToString(<PanelExample active="settings" panelFirst />);
    expect(tabStops(before)).toBe(1);
    expect(panel(before)).toContain('aria-labelledby="routed-tab"');
  });

  it('gives the active link the default id the panel points at', () => {
    const html = renderToString(<PanelExample active="activity" />);
    expect(links(html)[1]).toContain('id="routed-tab"');
  });
});
