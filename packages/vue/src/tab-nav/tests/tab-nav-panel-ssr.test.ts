// @vitest-environment jsdom
import { createSSRApp, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tabNavView, type TabNavViewOptions } from './fixtures';

let mounted: App | undefined;
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const makeApp = (options: TabNavViewOptions): App => createSSRApp({ render: tabNavView(options) });
const render = (options: TabNavViewOptions): Promise<string> => renderToString(makeApp(options));
const links = (html: string): string[] => [...html.matchAll(/<a\b[^>]*>/g)].map((match) => match[0]);
const stops = (html: string): number => links(html).filter((link) => link.includes('tabindex="0"')).length;
const panel = (html: string): string => /<div\b[^>]*role="tabpanel"[^>]*>/.exec(html)?.[0] ?? '';
const idOf = (tag: string): string | undefined => /\sid="([^"]*)"/.exec(tag)?.[1];

describe('TabNav panel mode server render', () => {
  it('makes the list a tablist, the links tabs and the panel a labelled tabpanel', async () => {
    const html = await render({ active: '#billing', panel: 'routed' });
    expect(html).toContain('<nav');
    expect(html).toMatch(/<div class="cck-tab-nav__list" role="tablist"/);
    const rendered = links(html);
    for (const link of rendered) {
      expect(link).toContain('role="tab"');
      expect(link).toContain('aria-controls="routed"');
      expect(link).not.toContain('aria-current');
    }
    expect(rendered[1]).toContain('aria-selected="true"');
    expect(rendered[0]).toContain('aria-selected="false"');
    expect(panel(html)).toContain('id="routed"');
    expect(panel(html)).toContain('tabindex="0"');
    expect(panel(html)).toContain('class="cck-tab-nav__panel"');
    expect(panel(html)).toContain(`aria-labelledby="${idOf(rendered[1] ?? '') ?? ''}"`);
  });

  it.each([
    ['first', '#profile', 0],
    ['middle', '#billing', 1],
    ['last', '#security', 2],
  ])('has exactly one Tab stop, the active link, when the %s link is active', async (_name, active, index) => {
    const html = await render({ active, panel: 'routed' });
    expect(stops(html)).toBe(1);
    expect(links(html)[index]).toContain('tabindex="0"');
  });

  it('gives the first enabled link the one Tab stop and the panel no label when no link is active', async () => {
    const html = await render({ active: undefined, panel: 'routed', panelProps: { hasActiveLink: false } });
    expect(stops(html)).toBe(1);
    expect(links(html)[0]).toContain('tabindex="0"');
    expect(panel(html)).not.toContain('aria-labelledby');
  });

  it('skips a disabled first link for the Tab stop', async () => {
    const html = await render({
      active: undefined,
      lockFirst: true,
      panel: 'routed',
      panelProps: { hasActiveLink: false },
    });
    expect(stops(html)).toBe(1);
    expect(links(html)[1]).toContain('tabindex="0"');
    expect(links(html)[0]).toContain('tabindex="-1"');
  });

  it('keeps link mode unchanged without a panel', async () => {
    const html = await render({ active: '#billing' });
    expect(html).not.toContain('role="tab');
    expect(html).not.toContain('role="tablist"');
  });
});

describe('TabNav panel mode hydration', () => {
  async function hydrate(options: TabNavViewOptions): Promise<{ container: HTMLElement; serverHtml: string }> {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await render(options);
    const serverHtml = container.innerHTML;
    mounted = makeApp(options);
    mounted.mount(container);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    return { container, serverHtml };
  }

  it.each([['#profile'], ['#security']])('hydrates with %s active without a mismatch', async (active) => {
    const { container, serverHtml } = await hydrate({ active, panel: 'routed' });
    expect(container.innerHTML.replace(/ style="[^"]*"/g, '')).toBe(serverHtml);
  });

  it('hydrates with no active link and keeps the one Tab stop', async () => {
    const { container, serverHtml } = await hydrate({
      active: undefined,
      lockFirst: true,
      panel: 'routed',
      panelProps: { hasActiveLink: false },
    });
    expect(container.innerHTML.replace(/ style="[^"]*"/g, '')).toBe(serverHtml);
    expect([...container.querySelectorAll('a')].filter((link) => link.tabIndex === 0)).toHaveLength(1);
  });
});
