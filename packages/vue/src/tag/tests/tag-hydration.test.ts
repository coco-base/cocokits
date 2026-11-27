// @vitest-environment jsdom
import { createSSRApp, h, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { Tag } from '../index';
import { testThemeConfig, view } from './fixtures';

let app: App | undefined;

afterEach(() => {
  app?.unmount();
  app = undefined;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

function makeApp(): App {
  return createSSRApp(
    view(() =>
      h(ThemeProvider, { themeConfig: testThemeConfig }, () => [
        h(Tag, null, () => 'Paid'),
        h(Tag, { role: 'status' }, () => [h('svg', { 'aria-hidden': 'true' }), 'Saved']),
        h(Tag, { as: 'template' }, () => h('strong', 'Beta')),
        h(Tag),
      ]),
    ),
  );
}

describe('Tag hydration', () => {
  it('hydrates the server markup without a mismatch', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(makeApp());
    const serverHtml = container.innerHTML;

    app = makeApp();
    app.mount(container);

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverHtml);
  });
});
