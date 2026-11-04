// @vitest-environment node
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@cocokits/react-core';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { TabNav } from '../src/index';

const html = (ui: ReactElement): string =>
  renderToString(<ThemeProvider themeConfig={cocokitsThemeConfig}>{ui}</ThemeProvider>);

describe('theme tab nav on the server', () => {
  it('has no window or document, so the import and render prove no DOM access', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('renders the options on the root and the indicator without geometry', () => {
    const markup = html(
      <TabNav.Root aria-label="Project" variant="line" color="brand" size="lg" headerAlign="stretch">
        <TabNav.List>
          <TabNav.Link href="#account" active>
            Account
          </TabNav.Link>
          <TabNav.Indicator />
        </TabNav.List>
      </TabNav.Root>,
    );
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
    expect(indicator).not.toBe('');
    expect(indicator).not.toContain('--active-tab');
    expect(indicator).not.toContain('data-variant');
    expect(markup).toContain('aria-current="page"');
  });
});
