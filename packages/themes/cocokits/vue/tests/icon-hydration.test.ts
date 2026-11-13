// @vitest-environment jsdom
import { createSSRApp, defineComponent, h, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { IconButton, SvgIcon } from '../src/index';

let app: App | undefined;

afterEach(() => {
  app?.unmount();
  app = undefined;
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

const makeApp = (): App =>
  createSSRApp(
    defineComponent({
      setup: () => () =>
        h(ThemeProvider, { themeConfig: cocokitsThemeConfig }, () => [
          h(IconButton, { 'aria-label': 'Add', variant: 'outline', rounded: true }, () =>
            h(SvgIcon, { iconName: 'plus' }),
          ),
          h(SvgIcon, { iconName: 'heart', label: 'Favourite', size: 'lg' }),
        ]),
    }),
  );

describe('theme IconButton and SvgIcon hydration', () => {
  it('hydrates the server markup unchanged and without warnings', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(makeApp());
    const serverHtml = container.innerHTML;
    expect(container.querySelectorAll('path').length).toBeGreaterThan(1);

    app = makeApp();
    app.mount(container);

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverHtml);
  });
});
