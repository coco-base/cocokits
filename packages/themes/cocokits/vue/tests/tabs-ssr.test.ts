// @vitest-environment node
import { createSSRApp, defineComponent, h, type Component } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { TabsContent, TabsIndicator, TabsList, TabsRoot, TabsTrigger } from '../src/index';

const render = async (): Promise<string> =>
  renderToString(
    createSSRApp(
      defineComponent({
        setup: () => () =>
          h(ThemeProvider, { themeConfig: cocokitsThemeConfig }, () =>
            h(
              TabsRoot as Component,
              { modelValue: 'account', variant: 'line', color: 'brand', size: 'lg', headerAlign: 'stretch' },
              () => [
                h(TabsList, { 'aria-label': 'Account settings' }, () => [
                  h(TabsTrigger, { value: 'account' }, () => 'Account'),
                  h(TabsIndicator),
                ]),
                h(TabsContent, { value: 'account' }, () => 'Change your name.'),
              ],
            ),
          ),
      }),
    ),
  );

describe('theme tabs on the server', () => {
  it('has no window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the options on the root and the indicator without geometry', async () => {
    const markup = await render();
    const root = /<div[^>]*cck-tabs"[^>]*>/.exec(markup)?.[0] ?? '';
    for (const part of [
      'data-variant="line"',
      'data-cck-color="brand"',
      'data-size="lg"',
      'data-header-align="stretch"',
    ]) {
      expect(root).toContain(part);
    }
    const indicator = /<span[^>]*cck-tabs__indicator[^>]*>/.exec(markup)?.[0] ?? '';
    expect(indicator).not.toContain('--active-tab');
    expect(indicator).not.toContain('data-variant');
    expect(markup).toContain('aria-selected="true"');
  });
});
