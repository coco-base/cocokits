// @vitest-environment jsdom
import { createSSRApp, defineComponent, h, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Badge } from '../src/index';

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
          h(Badge, { content: '120', max: 99, color: 'danger', size: 'lg' }),
          h(Badge),
        ]),
    }),
  );

describe('theme Badge hydration', () => {
  it('hydrates the server markup unchanged and without warnings', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(makeApp());
    const serverHtml = container.innerHTML;
    expect(container.querySelector('span')?.getAttribute('data-size')).toBe('lg');

    app = makeApp();
    app.mount(container);

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe(serverHtml);
  });
});
