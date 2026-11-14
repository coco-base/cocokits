// @vitest-environment node
import '@angular/compiler';
import { Component } from '@angular/core';
import { CckTabsImports } from '@cocokits/angular/tabs';
import { describe, expect, it } from 'vitest';
import { CckTabsTheme } from '../src/index';
import { renderThemedApp } from './ssr-helpers';

@Component({
  selector: 'app-root',
  imports: [CckTabsImports, CckTabsTheme],
  template: `<cck-tabs aria-label="Account settings" variant="line" color="brand" size="lg" headerAlign="stretch">
    <cck-tab [label]="first">Change your name.</cck-tab>
    <cck-tab label="Password">Change your password.</cck-tab>
  </cck-tabs>`,
})
class Root {
  protected readonly first = 'Account';
}

describe('theme tabs on the server', () => {
  it('has no window access and renders the options on the root', async () => {
    expect(typeof window).toBe('undefined');
    const html = await renderThemedApp(Root, true);
    const root = /<cck-tabs[^>]*class="cck-tabs"[^>]*>/.exec(html)?.[0] ?? '';
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
    const html = await renderThemedApp(Root, true);
    expect(html).toContain('aria-selected="true"');
    const indicator = /<span[^>]*cck-tabs__indicator[^>]*>/.exec(html)?.[0] ?? '';
    expect(indicator).not.toContain('--active-tab');
  });

  it('renders no theme attribute without a provider', async () => {
    const html = await renderThemedApp(Root, false);
    expect(/<cck-tabs[^>]*class="cck-tabs"[^>]*>/.exec(html)?.[0] ?? '').not.toContain('data-variant');
  });
});
