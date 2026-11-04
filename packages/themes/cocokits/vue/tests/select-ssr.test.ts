// @vitest-environment node
import { createSSRApp, defineComponent, h, type Component } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { SelectRoot } from '../src/index';
import { selectParts } from './select-parts';

const render = async (): Promise<string> =>
  renderToString(
    createSSRApp(
      defineComponent({
        setup: () => () =>
          h(ThemeProvider, { themeConfig: cocokitsThemeConfig }, () =>
            h(SelectRoot as Component, { size: 'lg', modelValue: 'cake', items: { cake: 'Cake' } }, () =>
              selectParts(),
            ),
          ),
      }),
    ),
  );

describe('theme select on the server', () => {
  it('has no window or document, so the import and render prove no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the size on the root, the label of the value and no list', async () => {
    const html = await render();
    expect(/<div[^>]*cck-select"[^>]*>/.exec(html)?.[0] ?? '').toContain('data-size="lg"');
    expect(html).toContain('>Cake<');
    expect(html).not.toContain('role="listbox"');
  });
});
