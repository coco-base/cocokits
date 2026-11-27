// @vitest-environment node
import { createSSRApp, defineComponent, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { Tag } from '../src/index';

describe('theme Tag on the server', () => {
  it('renders the class, the text and the theme data-* with no window or document', async () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
    const app = createSSRApp(
      defineComponent({
        setup: () => () =>
          h(ThemeProvider, { themeConfig: cocokitsThemeConfig }, () => [
            h(Tag, { variant: 'solid', color: 'success', size: 'lg', dot: true }, () => 'Paid'),
            h(Tag, null, () => 'Beta'),
          ]),
      }),
    );
    const html = await renderToString(app);
    const [first = '', second = ''] = html.match(/<span[^>]*>/g) ?? [];
    expect(first).toContain('cck-tag');
    expect(first).toContain('data-variant="solid"');
    expect(first).toContain('data-cck-color="success"');
    expect(first).toContain('data-size="lg"');
    expect(first).toContain('data-dot');
    expect(html).toContain('Paid');
    expect(second).toContain('data-variant="soft"');
    expect(second).not.toContain('data-dot');
  });
});
