// @vitest-environment jsdom
import userEvent from '@testing-library/user-event';
import { createSSRApp, nextTick, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { tabsView, type TabsViewOptions } from './fixtures';

let mounted: App | undefined;
afterEach(() => {
  mounted?.unmount();
  mounted = undefined;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const makeApp = (options: TabsViewOptions): App => createSSRApp({ render: tabsView(options) });

async function hydrate(options: TabsViewOptions): Promise<{ container: HTMLElement; serverHtml: string }> {
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  const container = document.body.appendChild(document.createElement('div'));
  container.innerHTML = await renderToString(makeApp(options));
  const serverHtml = container.innerHTML;
  mounted = makeApp(options);
  mounted.mount(container);
  expect(error).not.toHaveBeenCalled();
  expect(warn).not.toHaveBeenCalled();
  return { container, serverHtml };
}

describe('Tabs hydration', () => {
  it('hydrates the server markup without a mismatch and leaves it unchanged, then a click selects', async () => {
    const { container, serverHtml } = await hydrate({ root: { modelValue: 'password' } });
    // Only the indicator variables are new: they are measured after mount.
    expect(container.innerHTML.replace(/ style="[^"]*"/g, '')).toBe(serverHtml);
    expect(container.querySelector('.cck-tabs__indicator')?.getAttribute('style')).toContain('--active-tab-left');
    const notifications = [...container.querySelectorAll('[role="tab"]')][2] as HTMLElement;
    await userEvent.click(notifications);
    expect(notifications.getAttribute('aria-selected')).toBe('true');
  });

  it('hydrates a wrapped first trigger without a mismatch', async () => {
    const { container, serverHtml } = await hydrate({ wrapFirst: true });
    expect(container.querySelector('[role="tab"]')?.getAttribute('aria-selected')).toBe('true');
    expect(container.innerHTML.replace(/ style="[^"]*"/g, '')).toBe(serverHtml.replace(/ style="[^"]*"/g, ''));
  });

  it('hydrates a Tabs without a value, then selects the first enabled tab after mount', async () => {
    const { container } = await hydrate({});
    await nextTick();
    expect(container.querySelector('[role="tab"]')?.getAttribute('aria-selected')).toBe('true');
  });

  it('hydrates kept content and panels declared before the list without a mismatch', async () => {
    const { container, serverHtml } = await hydrate({
      root: { modelValue: 'password', unmountOnHide: false },
      panelsFirst: true,
    });
    expect(container.innerHTML.replace(/ style="[^"]*"/g, '')).toBe(serverHtml.replace(/ style="[^"]*"/g, ''));
    expect(container.textContent).toContain('Notifications panel');
  });
});
