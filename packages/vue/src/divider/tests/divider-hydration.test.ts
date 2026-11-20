// @vitest-environment jsdom
import { createSSRApp, h, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { Divider } from '../index';
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
        h(Divider),
        h(Divider, { orientation: 'vertical', 'aria-label': 'Side' }),
        h(Divider, { decorative: true }),
      ]),
    ),
  );
}

describe('Divider hydration', () => {
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
