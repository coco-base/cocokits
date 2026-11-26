// @vitest-environment node
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { Tag } from '../index';
import { testThemeConfig, view } from './fixtures';

describe('Tag on the server', () => {
  it('has no window or document, so the render proves no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the span with the class and its slot', async () => {
    const html = await renderToString(createSSRApp(view(() => h(Tag, null, () => 'Paid'))));
    // `<!--[-->` and `<!--]-->` are the slot fragment markers of the server render.
    expect(html).toBe('<span class="cck-tag"><!--[-->Paid<!--]--></span>');
  });

  it('renders the theme options into the markup, with no inline style', async () => {
    const html = await renderToString(
      createSSRApp(view(() => h(ThemeProvider, { themeConfig: testThemeConfig }, () => h(Tag, null, () => 'Paid')))),
    );
    expect(html).toContain('class="cck-tag"');
    expect(html).toContain('data-variant="soft"');
    expect(html).toContain('data-cck-color="neutral"');
    expect(html).toContain('data-size="md"');
    expect(html).toContain('data-dot="false"');
    expect(html).not.toContain('style=');
  });
});
