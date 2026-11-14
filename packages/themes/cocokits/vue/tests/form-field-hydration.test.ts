// @vitest-environment jsdom
import { createSSRApp, defineComponent, h, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Input } from '@cocokits/vue/input';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { FormField } from '../src/index';

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
          h(FormField, { size: 'lg' }, () => h(Input, { 'aria-label': 'Email' })),
          h(FormField, null, () => h(Input, { 'aria-label': 'Email' })),
        ]),
    }),
  );

describe('theme FormField hydration', () => {
  it('hydrates the server markup without a mismatch and keeps data-size on both parts', async () => {
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
    expect([...container.querySelectorAll('[data-size]')].map((el) => el.getAttribute('data-size'))).toEqual([
      'lg',
      'lg',
      'md',
      'md',
    ]);
  });
});
