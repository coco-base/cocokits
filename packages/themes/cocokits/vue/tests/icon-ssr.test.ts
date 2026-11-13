// @vitest-environment node
import { createSSRApp, defineComponent, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { IconButton, SvgIcon } from '../src/index';

const render = (): Promise<string> =>
  renderToString(
    createSSRApp(
      defineComponent({
        setup: () => () =>
          h(ThemeProvider, { themeConfig: cocokitsThemeConfig }, () => [
            h(IconButton, { 'aria-label': 'Add', variant: 'outline', size: 'lg', rounded: true }, () =>
              h(SvgIcon, { iconName: 'plus', size: 'sm', rtlMirror: true }),
            ),
            h(SvgIcon, { iconName: 'heart', label: 'Favourite', color: 'danger' }),
          ]),
      }),
    ),
  );

describe('theme IconButton and SvgIcon on the server', () => {
  it('has no window or document, so the import and render prove no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the options as data-* and the full icon in the markup', async () => {
    const html = await render();
    const button = /<button[^>]*>/.exec(html)?.[0] ?? '';
    expect(button).toContain('class="cck-icon-button"');
    expect(button).toContain('data-variant="outline"');
    expect(button).toContain('data-size="lg"');
    expect(button).toMatch(/ data-rounded[ >=]/);
    const icons = [...html.matchAll(/<span[^>]*cck-svg-icon[^>]*>/g)].map((match) => match[0]);
    expect(icons[0]).toContain('data-size="sm"');
    expect(icons[0]).toMatch(/ data-rtl-mirror[ >=]/);
    expect(icons[1]).toContain('data-cck-color="danger"');
    expect(icons[1]).toContain('role="img"');
    expect(html).toContain('<svg class="cck-svg-icon__svg" viewBox="0 0 24 24">');
    expect(html).toMatch(/<path d="[^"]+"/);
  });
});
