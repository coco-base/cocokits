// @vitest-environment node
import '@angular/compiler';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckBadgeImports } from '@cocokits/angular/badge';
import { describe, expect, it } from 'vitest';
import { CckBadgeTheme } from '../src/index';
import { providers } from './helpers';

@Component({
  selector: 'app-root',
  imports: [CckBadgeImports, CckBadgeTheme],
  template: `
    <span cckBadge [content]="count" variant="rectangle" color="danger" size="lg"></span>
    <span cckBadge></span>
  `,
})
class Root {
  readonly count = 5;
}

const render = (themed: boolean): Promise<string> =>
  renderApplication(
    (context) =>
      bootstrapApplication(Root, { providers: [provideServerRendering(), ...(themed ? providers : [])] }, context),
    { document: '<html><body><app-root></app-root></body></html>' },
  );

describe('theme Badge server render', () => {
  it('contains the class, the content and the theme data-* without window access', async () => {
    expect(typeof window).toBe('undefined');
    const html = await render(true);
    const first = /<span[^>]*>/.exec(html)?.[0] ?? '';
    expect(first).toContain('class="cck-badge"');
    expect(first).toContain('data-variant="rectangle"');
    expect(first).toContain('data-cck-color="danger"');
    expect(first).toContain('data-size="lg"');
    expect(html).toContain('>5</span>');
    const dot = /<span[^>]*data-empty[^>]*>/.exec(html)?.[0] ?? '';
    expect(dot).toContain('data-cck-color="contrast"');
  });

  it('renders no theme data-* without a theme', async () => {
    expect(await render(false)).not.toMatch(/data-variant|data-cck-color|data-size/);
  });
});
