// @vitest-environment node
import '@angular/compiler';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckTabNavImports } from '@cocokits/angular/tab-nav';
import { describe, expect, it } from 'vitest';
import { CckTabNavTheme } from '../src/index';
import { providers } from './helpers';

@Component({
  selector: 'app-root',
  imports: [CckTabNavImports, CckTabNavTheme],
  template: `<nav cckTabNav aria-label="Project" variant="line" color="brand" size="lg" headerAlign="stretch">
    <a cckTabNavLink href="#account" [active]="current">Account</a>
    <a cckTabNavLink href="#password">Password</a>
  </nav>`,
})
class Root {
  protected readonly current = true;
}

const render = (themed: boolean): Promise<string> =>
  renderApplication(
    (context) =>
      bootstrapApplication(Root, { providers: [provideServerRendering(), ...(themed ? providers : [])] }, context),
    { document: '<html><body><app-root></app-root></body></html>' },
  );

describe('theme tab nav on the server', () => {
  it('has no window access and renders the options on the root', async () => {
    expect(typeof window).toBe('undefined');
    const html = await render(true);
    const root = /<nav[^>]*class="cck-tab-nav"[^>]*>/.exec(html)?.[0] ?? '';
    for (const part of [
      'data-variant="line"',
      'data-cck-color="brand"',
      'data-size="lg"',
      'data-header-align="stretch"',
    ]) {
      expect(root).toContain(part);
    }
  });

  it('renders the active link and the indicator without geometry', async () => {
    const html = await render(true);
    expect(html).toContain('aria-current="page"');
    const indicator = /<span[^>]*cck-tab-nav__indicator[^>]*>/.exec(html)?.[0] ?? '';
    expect(indicator).not.toContain('--active-tab');
  });

  it('renders no theme attribute without a provider', async () => {
    const html = await render(false);
    expect(/<nav[^>]*class="cck-tab-nav"[^>]*>/.exec(html)?.[0] ?? '').not.toContain('data-variant');
  });
});
