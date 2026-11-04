// @vitest-environment node
import { createSSRApp, defineComponent, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { FieldError } from '@cocokits/vue/field-error';
import { Prefix } from '@cocokits/vue/prefix';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { FormField, Textarea } from '../src/index';

const render = async (themed: boolean): Promise<string> => {
  const content = () => [
    h(FormField, null, {
      default: () => h(Textarea, { 'aria-label': 'Message', autoResize: true }),
      prefix: () => h(Prefix, null, () => 'P'),
      error: () => h(FieldError, null, () => 'Enter a message.'),
    }),
    h(Textarea, { 'aria-label': 'Plain' }),
  ];
  const app = createSSRApp(
    defineComponent({
      setup: () => () => (themed ? h(ThemeProvider, { themeConfig: cocokitsThemeConfig }, content) : content()),
    }),
  );
  return renderToString(app);
};

describe('theme Textarea on the server', () => {
  it('has no window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders data-auto-resize only on the Textarea that sets it', async () => {
    const html = await render(true);
    expect(html.match(/data-auto-resize/g)).toHaveLength(1);
    expect(html).toMatch(/<textarea[^>]*data-auto-resize(="")?[ >]/);
  });

  it('renders the FieldError as a live region with no child node but comments', async () => {
    expect(await render(true)).toMatch(/<div[^>]*aria-live="polite"[^>]*>(<!--[^>]*-->)*<\/div>/);
  });

  it('renders no data-auto-resize without a theme provider', async () => {
    expect(await render(false)).not.toContain('data-auto-resize');
  });
});
