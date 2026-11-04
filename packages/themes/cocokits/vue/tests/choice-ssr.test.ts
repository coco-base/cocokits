// @vitest-environment node
import { createSSRApp, defineComponent, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Checkbox, Radio, Switch } from '../src/index';

const render = async (): Promise<string> =>
  renderToString(
    createSSRApp(
      defineComponent({
        setup: () => () =>
          h(ThemeProvider, { themeConfig: cocokitsThemeConfig }, () => [
            h(
              Checkbox,
              { modelValue: true, indeterminate: true, size: 'lg', color: 'danger', labelPosition: 'before' },
              () => 'Accept',
            ),
            h(Switch, { disabled: true }, () => 'Alerts'),
            h('fieldset', null, [
              h(Radio, { name: 'plan', value: 'a', modelValue: true }, () => 'A'),
              h(Radio, { name: 'plan', value: 'b', modelValue: false }, () => 'B'),
            ]),
          ]),
      }),
    ),
  );

describe('theme choice controls on the server', () => {
  it('has no window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the options and the checked mark of a Checkbox in the server HTML', async () => {
    const root = /<div[^>]*cck-checkbox[^>]*>/.exec(await render())?.[0] ?? '';
    for (const part of [
      'class="cck-checkbox"',
      'data-size="lg"',
      'data-cck-color="danger"',
      'data-label-position="before"',
      'data-checked',
      'data-indeterminate',
    ]) {
      expect(root).toContain(part);
    }
  });

  it('renders the Switch role, the disabled fact and the defaults', async () => {
    const html = await render();
    const root = /<div[^>]*cck-switch[^>]*>/.exec(html)?.[0] ?? '';
    expect(root).toContain('data-size="md"');
    expect(root).toContain('data-cck-color="brand"');
    expect(root).toContain('data-label-position="after"');
    expect(root).toContain('data-disabled');
    expect(html).toContain('role="switch"');
  });

  it('renders same-name Radios with the checked one marked', async () => {
    const html = await render();
    expect(html.match(/class="cck-radio"/g)).toHaveLength(2);
    expect(html.match(/<div[^>]*data-checked[^>]*class="cck-radio"/g)).toHaveLength(1);
  });
});
