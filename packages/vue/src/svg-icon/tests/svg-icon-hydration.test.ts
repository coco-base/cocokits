// @vitest-environment jsdom
import { createSSRApp, h, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { SvgIcon } from '../index';
import { iconsThemeConfig, view } from './fixtures';

let app: App | undefined;

afterEach(() => {
  app?.unmount();
  app = undefined;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const makeApp = (): App =>
  createSSRApp(
    view(() =>
      h(ThemeProvider, { themeConfig: iconsThemeConfig }, () => [
        h(SvgIcon, { iconName: 'heart' }),
        h(SvgIcon, { iconName: 'plus', label: 'Add' }),
      ]),
    ),
  );

describe('SvgIcon hydration', () => {
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
    expect(container.querySelectorAll('path')).toHaveLength(3);
  });
});
