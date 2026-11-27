// @vitest-environment node
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { Divider } from '../index';
import { testThemeConfig, view } from './fixtures';

describe('Divider on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the hr with the machine and theme attributes and no id or style', async () => {
    const html = await renderToString(
      createSSRApp(
        view(() =>
          h(ThemeProvider, { themeConfig: testThemeConfig }, () => [
            h(Divider),
            h(Divider, { orientation: 'vertical' }),
            h(Divider, { decorative: true }),
            h(Divider, { orientation: 'vertical', decorative: true }),
          ]),
        ),
      ),
    );
    expect(html).toContain('class="cck-divider"');
    expect(html).toContain('data-orientation="horizontal"');
    expect(html).toContain('data-orientation="vertical"');
    expect(html).toContain('aria-orientation="vertical"');
    expect(html).toContain('role="none"');
    expect(html).toContain('data-size="md"');
    expect(html).toContain('data-color="default"');
    expect(html.match(/<hr /g)).toHaveLength(4);
    const decorativeVertical = html.split('<hr ')[4] ?? '';
    expect(decorativeVertical).toContain('data-orientation="vertical"');
    expect(decorativeVertical).toContain('role="none"');
    expect(decorativeVertical).not.toContain('aria-orientation');
    expect(html).not.toContain('style=');
    expect(html).not.toContain(' id=');
  });
});
