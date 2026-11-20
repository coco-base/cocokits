// @vitest-environment node
import { createSSRApp, defineComponent, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { DialogContent, DialogRoot, DialogTitle, DialogTrigger } from '../src/index';

const render = (): Promise<string> =>
  renderToString(
    createSSRApp(
      defineComponent({
        setup: () => () =>
          h(ThemeProvider, { themeConfig: cocokitsThemeConfig }, () =>
            h(DialogRoot, { defaultOpen: true, size: 'lg' }, () => [
              h(DialogTrigger, null, () => 'Open'),
              h(DialogContent, { 'aria-label': 'Panel' }, () => h(DialogTitle, null, () => 'Delete project')),
            ]),
          ),
      }),
    ),
  );

describe('theme dialog on the server', () => {
  it('has no window or document, so the import and render prove no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  // The base content renders nothing on the server, even for a dialog that starts open, so no `data-size` is there
  // to read: the size shows after hydration (`dialog-hydration.test.ts`).
  it('renders the trigger of a dialog with a root size that is open at start, and no content', async () => {
    const html = await render();
    expect(html).toContain('aria-expanded="true"');
    expect(html).not.toContain('<dialog');
    expect(html).not.toContain('data-size');
  });
});
