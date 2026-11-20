// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
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
  window.location.hash = '';
});

const makeApp = (options: TabNavViewOptions): App => createSSRApp({ render: tabNavView(options) });
const render = (options: TabNavViewOptions = {}): Promise<string> => renderToString(makeApp(options));

describe('TabNav server render', () => {
  it('renders every part with the active link marked and no indicator variable', async () => {
    const html = await render({ active: '#billing' });
    expect(html).toContain('class="cck-tab-nav"');
    expect(html).toContain('aria-label="Account"');
    expect(html).toContain('class="cck-tab-nav__list"');
    expect(html).toContain('<span class="cck-tab-nav__indicator" aria-hidden="true"></span>');
    const links = [...html.matchAll(/<a\b[^>]*>/g)].map((match) => match[0]);
    expect(links).toHaveLength(3);
    expect(links[1]).toContain('aria-current="page"');
    expect(links[1]).toMatch(/\sdata-active(?=[\s>])/);
    expect(links[0]).not.toContain('aria-current');
    expect(html).not.toContain('--active-tab');
    expect(html).not.toContain('role="tab');
  });

  it('marks a disabled link', async () => {
    const html = await render({ lockBilling: true });
    const billing = [...html.matchAll(/<a\b[^>]*>/g)].map((match) => match[0])[1];
    expect(billing).toContain('aria-disabled="true"');
    expect(billing).toContain('tabindex="-1"');
    expect(billing).toMatch(/\sdata-disabled(?=[\s>])/);
  });
});

describe('TabNav hydration', () => {
  it('hydrates the server markup without a mismatch and leaves it unchanged, then a click follows', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const options = { active: '#profile' };
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await render(options);
    const serverHtml = container.innerHTML;
    mounted = makeApp(options);
    mounted.mount(container);
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    // Only the indicator variables are new: they are measured after mount.
    expect(container.innerHTML.replace(/ style="[^"]*"/g, '')).toBe(serverHtml);
    await userEvent.click(container.querySelectorAll('a')[2]);
    expect(window.location.hash).toBe('#security');
  });
});
