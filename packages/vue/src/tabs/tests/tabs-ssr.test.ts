import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { tabsView } from './fixtures';

async function render(options: Parameters<typeof tabsView>[0]): Promise<string> {
  return renderToString(createSSRApp({ render: tabsView(options) }));
}

describe('Tabs server render', () => {
  it('renders every part with the bound tab selected, the tab stop and the hidden panels in place', async () => {
    const html = await render({ root: { modelValue: 'password' } });
    const tabs = [...html.matchAll(/<button\b[^>]*role="tab"[^>]*>/g)].map((match) => match[0]);
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toContain('aria-selected="false"');
    expect(tabs[0]).toContain('tabindex="-1"');
    expect(tabs[1]).toContain('aria-selected="true"');
    expect(tabs[1]).toContain('tabindex="0"');
    expect(tabs[1]).toMatch(/\sdata-selected(?=[\s>])/);
    expect(tabs[1]).toContain('aria-controls="');
    const panels = [...html.matchAll(/<div\b[^>]*role="tabpanel"[^>]*>/g)].map((match) => match[0]);
    expect(panels).toHaveLength(3);
    expect(panels[0]).toContain('hidden');
    expect(panels[1]).not.toContain('hidden');
    expect(panels[1]).toContain('aria-labelledby="');
    expect(html).toContain('class="cck-tabs__indicator"');
    expect(html).toContain('aria-label="Account settings"');
  });

  it('marks a disabled tab and renders the vertical orientation', async () => {
    const html = await render({ root: { modelValue: 'account', orientation: 'vertical' }, lockPassword: true });
    expect(html).toContain('aria-orientation="vertical"');
    expect(html).toMatch(/\sdata-disabled(?=[\s>])/);
    expect(html).toMatch(/<button\b(?=[^>]*\sdisabled(?=[\s>=]))(?=[^>]*role="tab")/);
  });

  it('writes no indicator variable and selects the first trigger in tree order without a value', async () => {
    const html = await render({});
    expect(html).not.toContain('--active-tab');
    const tabs = [...html.matchAll(/<button\b[^>]*role="tab"[^>]*>/g)].map((match) => match[0]);
    expect(tabs[0]).toContain('aria-selected="true"');
    expect(tabs[0]).toContain('tabindex="0"');
    expect(tabs[1]).toContain('aria-selected="false"');
    expect(tabs[2]).toContain('tabindex="-1"');
    const panels = [...html.matchAll(/<div\b[^>]*role="tabpanel"[^>]*>/g)].map((match) => match[0]);
    expect(panels[0]).not.toContain('hidden');
    expect(panels[1]).toContain('hidden');
  });

  it('selects the first trigger even when it sits inside a wrapper component', async () => {
    const html = await render({ wrapFirst: true });
    const tabs = [...html.matchAll(/<button\b[^>]*role="tab"[^>]*>/g)].map((match) => match[0]);
    expect(tabs[0]).toContain('aria-selected="true"');
    const panels = [...html.matchAll(/<div\b[^>]*role="tabpanel"[^>]*>/g)].map((match) => match[0]);
    expect(panels[0]).not.toContain('hidden');
  });

  it('skips a disabled first trigger when it picks the server selection', async () => {
    const html = await render({ lockFirst: true });
    const tabs = [...html.matchAll(/<button\b[^>]*role="tab"[^>]*>/g)].map((match) => match[0]);
    expect(tabs[0]).toContain('aria-selected="false"');
    expect(tabs[1]).toContain('aria-selected="true"');
  });

  it('renders the root as one element around the list and the panels', async () => {
    const html = await renderToString(createSSRApp({ render: () => h('div', tabsView({})()) }));
    expect(html).toContain('<div class="cck-tabs"');
  });

  it('renders the content of the selected panel only, and every content with unmountOnHide set to false', async () => {
    const lazy = await render({ root: { modelValue: 'password' } });
    expect(lazy).toContain('Password panel');
    expect(lazy).not.toContain('Account panel');
    expect(lazy).not.toContain('Notifications panel');
    const kept = await render({ root: { modelValue: 'password', unmountOnHide: false } });
    for (const text of ['Account panel', 'Password panel', 'Notifications panel']) expect(kept).toContain(text);
    const panelTags = [...kept.matchAll(/<div\b[^>]*role="tabpanel"[^>]*>/g)].map((match) => match[0]);
    expect(panelTags.filter((tag) => /\shidden(?=[\s>=])/.test(tag))).toHaveLength(2);
  });

  it.each([[false], [true]])(
    'resolves every aria-controls and aria-labelledby in the HTML (panels first: %s)',
    async (panelsFirst) => {
      const html = await render({ root: { modelValue: 'account' }, panelsFirst });
      const ids = new Set([...html.matchAll(/\sid="([^"]*)"/g)].map((match) => match[1]));
      const controls = [...html.matchAll(/aria-controls="([^"]*)"/g)].map((match) => match[1]);
      const labels = [...html.matchAll(/aria-labelledby="([^"]*)"/g)].map((match) => match[1]);
      expect(controls).toHaveLength(3);
      expect(labels).toHaveLength(3);
      for (const id of [...controls, ...labels]) expect(ids.has(id)).toBe(true);
    },
  );

  it('writes no indicator when the list holds none', async () => {
    expect(await render({ indicator: false })).not.toContain('cck-tabs__indicator');
  });
});
