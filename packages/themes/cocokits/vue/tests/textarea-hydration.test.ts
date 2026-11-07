// @vitest-environment jsdom
import { createSSRApp, defineComponent, h, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FieldError } from '@cocokits/vue/field-error';
import { Prefix } from '@cocokits/vue/prefix';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { FormField, Textarea } from '../src/index';

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
          h(FormField, null, {
            default: () => h(Textarea, { 'aria-label': 'Message', autoResize: true }),
            prefix: () => h(Prefix, null, () => 'P'),
            error: () => h(FieldError, null, () => 'Enter a message.'),
          }),
          h(Textarea, { 'aria-label': 'Plain' }),
        ]),
    }),
  );

describe('theme Textarea hydration', () => {
  it('hydrates the server markup without a mismatch and keeps data-auto-resize', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(makeApp());
    const serverHtml = container.innerHTML;

    app = makeApp();
    app.mount(container);

    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    // jsdom reflects the textarea value as an attribute once Vue sets the property; the markup is otherwise the same.
    expect(container.innerHTML.replaceAll(' value=""', '')).toBe(serverHtml);
    expect(container.querySelectorAll('[data-auto-resize]')).toHaveLength(1);
    expect(container.querySelector('.cck-field-error')?.matches(':empty')).toBe(true);
  });
});
