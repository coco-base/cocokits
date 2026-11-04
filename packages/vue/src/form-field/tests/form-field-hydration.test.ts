// @vitest-environment jsdom
import { createSSRApp, h, type App } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineThemeConfig } from '@cocokits/shared';
import { ThemeProvider } from '@cocokits/vue-core';
import { Hint } from '../../hint';
import { Label } from '../../label';
import { FormField } from '../index';
import { view } from '../../internal/tests/mount-helpers';

const themeConfig = defineThemeConfig({
  name: 'test',
  components: {
    'form-field': { tone: { attrName: 'tone', values: ['plain'], default: 'plain', partNames: ['root'] } },
  },
});

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
      h(ThemeProvider, { themeConfig }, () => [
        h(FormField, null, {
          label: () => h(Label, { for: 'i' }, () => 'Name'),
          default: () => h('input', { id: 'i', 'aria-describedby': 'h' }),
          hint: () => h(Hint, { id: 'h' }, () => 'Help'),
        }),
        h(FormField, null, { default: () => h('input') }),
        h(FormField, { asChild: true }, () => h('fieldset', null, [h('input')])),
        h(Label, null, () => 'Alone'),
        h(Hint, null, () => 'Alone'),
      ]),
    ),
  );
}

describe('FormField hydration', () => {
  it('hydrates the server markup without a mismatch, with and without a hint', async () => {
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

  it('keeps the feedbackWrapper matching :empty after hydration when there is no hint', async () => {
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = await renderToString(makeApp());
    app = makeApp();
    app.mount(container);
    const feedback = container.querySelectorAll('.cck-form-field__feedback-wrapper');
    expect(feedback[1].matches(':empty')).toBe(true);
    expect(feedback[0].matches(':empty')).toBe(false);
  });
});
