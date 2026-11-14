// @vitest-environment node
import { createSSRApp, defineComponent, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { Input } from '@cocokits/vue/input';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { FormField } from '../src/index';

const render = async (themed: boolean): Promise<string> => {
  const fields = () => [
    h(FormField, { size: 'lg' }, () => h(Input, { 'aria-label': 'Email' })),
    h(FormField, null, () => h(Input, { 'aria-label': 'Email' })),
  ];
  const app = createSSRApp(
    defineComponent({
      setup: () => () => (themed ? h(ThemeProvider, { themeConfig: cocokitsThemeConfig }, fields) : fields()),
    }),
  );
  return renderToString(app);
};

describe('theme FormField on the server', () => {
  it('has no window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders data-size on the root and the input wrapper, lg and the default md', async () => {
    const html = await render(true);
    expect(html.match(/data-size="lg"/g)).toHaveLength(2);
    expect(html.match(/data-size="md"/g)).toHaveLength(2);
    expect(html).toMatch(
      /<div[^>]*data-size="lg"[^>]*class="cck-form-field__input-wrapper"|<div[^>]*class="cck-form-field__input-wrapper"[^>]*data-size="lg"/,
    );
  });

  it('renders no data-size without a theme provider', async () => {
    expect(await render(false)).not.toContain('data-size');
  });
});
