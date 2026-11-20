// @vitest-environment node
import { createSSRApp, defineComponent, h, type Component } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/vue-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { TabNavIndicator, TabNavLink, TabNavList, TabNavRoot } from '../src/index';

const render = async (): Promise<string> =>
  renderToString(
    createSSRApp(
      defineComponent({
        setup: () => () =>
          h(ThemeProvider, { themeConfig: cocokitsThemeConfig }, () =>
            h(
              TabNavRoot as Component,
              { 'aria-label': 'Project', variant: 'line', color: 'brand', size: 'lg', headerAlign: 'stretch' },
              () =>
                h(TabNavList, null, () => [
                  h(TabNavLink, { href: '#account', active: true }, () => 'Account'),
                  h(TabNavIndicator),
                ]),
            ),
          ),
      }),
    ),
  );

describe('theme tab nav on the server', () => {
  it('has no window or document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the options on the root and the indicator without geometry', async () => {
    const markup = await render();
    const root = /<nav[^>]*cck-tab-nav"[^>]*>/.exec(markup)?.[0] ?? '';
    for (const part of [
      'data-variant="line"',
      'data-cck-color="brand"',
      'data-size="lg"',
      'data-header-align="stretch"',
    ]) {
      expect(root).toContain(part);
    }
    const indicator = /<span[^>]*cck-tab-nav__indicator[^>]*>/.exec(markup)?.[0] ?? '';
    expect(indicator).not.toContain('--active-tab');
    expect(indicator).not.toContain('data-variant');
    expect(markup).toContain('aria-current="page"');
  });
});
