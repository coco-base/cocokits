// @vitest-environment node
import { createSSRApp, defineComponent, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Button } from '../src/index';

describe('theme Button on the server', () => {
  it('has no window or document, so the import and render prove no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the class, type, disabled markers and theme data-*', async () => {
    const app = createSSRApp(
      defineComponent({
        setup: () => () =>
          h(ThemeProvider, { themeConfig: cocokitsThemeConfig }, () => [
            h(Button, { variant: 'outline', color: 'danger', size: 'lg' }, () => 'Save'),
            h(Button, { disabled: true }, () => 'Off'),
          ]),
      }),
    );
    const html = await renderToString(app);
    const tag = (text: string): string =>
      new RegExp(`<button[^>]*>(?:<!--\\[-->)*${text}(?:<!--\\]-->)*</button>`).exec(html)?.[0] ?? '';
    const on = tag('Save');
    expect(on).toContain('class="cck-button"');
    expect(on).toContain('type="button"');
    expect(on).toContain('data-variant="outline"');
    expect(on).toContain('data-cck-color="danger"');
    expect(on).toContain('data-size="lg"');
    const off = tag('Off');
    expect(off).toMatch(/ disabled[ >]/);
    expect(off).toMatch(/ data-disabled[ >]/);
    expect(off).toContain('data-variant="primary"');
  });
});
