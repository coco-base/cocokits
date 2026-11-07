// @vitest-environment node
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Tabs } from '../index';
import { Example } from './fixtures';

const attributeValues = (html: string, attribute: string): string[] =>
  [...html.matchAll(new RegExp(`${attribute}="([^"]+)"`, 'g'))].map((match) => match[1]);

/** Two tabs whose second value needs encoding, with the Contents before or after the List. */
function page(contentFirst: boolean, forceMount?: true): ReactElement {
  const list = (
    <Tabs.List aria-label="Tabs">
      <Tabs.Trigger value="one">One</Tabs.Trigger>
      <Tabs.Trigger value="two words">Two</Tabs.Trigger>
    </Tabs.List>
  );
  const contents = [
    <Tabs.Content key="1" value="one">
      first body
    </Tabs.Content>,
    <Tabs.Content key="2" value="two words" forceMount={forceMount}>
      second body
    </Tabs.Content>,
  ];
  return (
    <Tabs.Root defaultValue="one">
      {contentFirst ? contents : list}
      {contentFirst ? list : contents}
    </Tabs.Root>
  );
}

describe('Tabs on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders every part with the default tab selected, the tab stop and the hidden panels in place', () => {
    const html = renderToString(<Example defaultValue="password" />);
    const tabs = [...html.matchAll(/<button\b[^>]*role="tab"[^>]*>/g)].map((match) => match[0]);
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toContain('aria-selected="false"');
    expect(tabs[0]).toContain('tabindex="-1"');
    expect(tabs[1]).toContain('aria-selected="true"');
    expect(tabs[1]).toContain('tabindex="0"');
    expect(tabs[1]).toContain('data-selected=""');
    expect(tabs[1]).toContain('aria-controls="');
    const panels = [...html.matchAll(/<div\b[^>]*role="tabpanel"[^>]*>/g)].map((match) => match[0]);
    expect(panels).toHaveLength(3);
    expect(panels[0]).toContain('hidden');
    expect(panels[1]).not.toContain('hidden');
    expect(panels[1]).toContain('aria-labelledby="');
    expect(html).toContain('class="cck-tabs__indicator"');
    expect(html).toContain('aria-label="Account settings"');
  });

  it('marks a disabled tab and renders the vertical orientation', () => {
    const html = renderToString(<Example defaultValue="account" lockPassword orientation="vertical" />);
    expect(html).toContain('aria-orientation="vertical"');
    expect(html).toContain('data-disabled=""');
    expect(html).toMatch(/<button\b(?=[^>]*\bdisabled=)(?=[^>]*role="tab")/);
  });

  it('writes no indicator variable on the server', () => {
    const html = renderToString(<Example defaultValue="account" />);
    expect(html).not.toContain('--active-tab');
  });

  it('selects no tab in the server output without a value or defaultValue, and sets no render-phase state', () => {
    const html = renderToString(<Example />);
    expect(html).not.toContain('aria-selected="true"');
    expect(html.match(/role="tabpanel"[^>]*hidden/g)).toHaveLength(3);
    expect(html.match(/<button\b[^>]*role="tab"[^>]*tabindex="0"/g)).toBeNull();
  });

  it('renders the content of the default panel only, and every panel element', () => {
    const html = renderToString(page(false));
    expect(html).toContain('first body');
    expect(html).not.toContain('second body');
    expect(html.match(/role="tabpanel"/g)).toHaveLength(2);
  });

  it('keeps the content of a forceMount panel, which stays hidden', () => {
    const html = renderToString(page(false, true));
    expect(html).toContain('second body');
    const panels = [...html.matchAll(/<div\b[^>]*role="tabpanel"[^>]*>/g)].map((match) => match[0]);
    expect(panels[1]).toContain('hidden');
  });

  it.each([false, true])('resolves every aria-controls and aria-labelledby with the contents first = %s', (first) => {
    const html = renderToString(page(first));
    const all = attributeValues(html, 'id');
    const controls = attributeValues(html, 'aria-controls');
    const labelledBy = attributeValues(html, 'aria-labelledby');
    expect(controls).toHaveLength(2);
    expect(labelledBy).toHaveLength(2);
    [...controls, ...labelledBy].forEach((id) => {
      expect(all).toContain(id);
    });
    expect(new Set(all).size).toBe(all.length);
  });
});
