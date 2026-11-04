// @vitest-environment jsdom
import { createSSRApp, defineComponent, h, nextTick, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Checkbox, Radio, Switch } from '../src/index';

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
          h(Checkbox, { modelValue: true, size: 'sm', color: 'success' }, () => 'Accept'),
          h(Switch, { labelPosition: 'before' }, () => 'Alerts'),
          h('fieldset', null, [
            h(Radio, { name: 'plan', value: 'a', modelValue: true }, () => 'A'),
            h(Radio, { name: 'plan', value: 'b', size: 'lg' }, () => 'B'),
          ]),
        ]),
    }),
  );

describe('theme choice controls hydration', () => {
  it('hydrates the server markup without a mismatch and keeps the options', async () => {
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
    expect(container.querySelectorAll('[data-size]')).toHaveLength(4);
    expect(container.querySelector('.cck-checkbox')?.hasAttribute('data-checked')).toBe(true);

    // Still interactive: one click on the Switch input turns it on.
    container.querySelector<HTMLInputElement>('.cck-switch__input')?.click();
    await nextTick();
    expect(container.querySelector('.cck-switch')?.hasAttribute('data-checked')).toBe(true);
  });
});
