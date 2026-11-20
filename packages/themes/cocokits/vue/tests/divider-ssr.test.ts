// @vitest-environment node
import { createSSRApp, defineComponent, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Divider } from '../src/index';

describe('theme Divider on the server', () => {
  it('renders the class and the theme data-* with no window or document', async () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    const app = createSSRApp(
      defineComponent({
        setup: () => () =>
          h(ThemeProvider, { themeConfig: cocokitsThemeConfig }, () => [
            h(Divider, { size: 'lg', color: 'dark', orientation: 'vertical' }),
            h(Divider),
          ]),
      }),
    );
    const html = await renderToString(app);
    const [first = '', second = ''] = html.match(/<hr[^>]*>/g) ?? [];
    expect(first).toContain('class="cck-divider"');
    expect(first).toContain('data-orientation="vertical"');
    expect(first).toContain('data-size="lg"');
    expect(first).toContain('data-color="dark"');
    expect(second).toContain('data-size="md"');
    expect(second).toContain('data-color="default"');
  });
});
