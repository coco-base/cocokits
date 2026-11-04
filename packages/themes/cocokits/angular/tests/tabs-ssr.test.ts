// @vitest-environment node
import '@angular/compiler';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckTabsImports } from '@cocokits/angular/tabs';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { describe, expect, it } from 'vitest';
import { CckTabsTheme } from '../src/index';

@Component({
  selector: 'app-root',
  imports: [CckTabsImports, CckTabsTheme],
  template: `<div cckTabs aria-label="Account settings" variant="line" color="brand" size="lg" headerAlign="stretch">
    <div cckTab [label]="first">Change your name.</div>
    <div cckTab label="Password">Change your password.</div>
  </div>`,
})
class Root {
  protected readonly first = 'Account';
}

const render = (themed: boolean): Promise<string> =>
  renderApplication(
    (context) =>
      bootstrapApplication(
        Root,
        { providers: [provideServerRendering(), ...(themed ? [provideCckTheme(cocokitsThemeConfig)] : [])] },
        context,
      ),
    { document: '<html><body><app-root></app-root></body></html>' },
  );

describe('theme tabs on the server', () => {
  it('has no window access and renders the options on the root', async () => {
    expect(typeof window).toBe('undefined');
    const html = await render(true);
    const root = /<div[^>]*class="cck-tabs"[^>]*>/.exec(html)?.[0] ?? '';
    for (const part of [
      'data-variant="line"',
      'data-cck-color="brand"',
      'data-size="lg"',
      'data-header-align="stretch"',
    ]) {
      expect(root).toContain(part);
    }
  });

  it('renders the first tab selected and the indicator without geometry', async () => {
    const html = await render(true);
    expect(html).toContain('aria-selected="true"');
    const indicator = /<span[^>]*cck-tabs__indicator[^>]*>/.exec(html)?.[0] ?? '';
    expect(indicator).not.toContain('--active-tab');
  });

  it('renders no theme attribute without a provider', async () => {
    const html = await render(false);
    expect(/<div[^>]*class="cck-tabs"[^>]*>/.exec(html)?.[0] ?? '').not.toContain('data-variant');
  });
});
