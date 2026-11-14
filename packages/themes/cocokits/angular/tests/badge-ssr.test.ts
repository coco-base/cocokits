// @vitest-environment node
import '@angular/compiler';
import { Component } from '@angular/core';
import { CckBadgeImports } from '@cocokits/angular/badge';
import { describe, expect, it } from 'vitest';
import { CckBadgeTheme } from '../src/index';
import { renderThemedApp } from './ssr-helpers';

@Component({
  selector: 'app-root',
  imports: [CckBadgeImports, CckBadgeTheme],
  template: `
    <cck-badge [content]="count" variant="rectangle" color="danger" size="lg"></cck-badge>
    <cck-badge></cck-badge>
  `,
})
class Root {
  readonly count = 5;
}

describe('theme Badge server render', () => {
  it('contains the class, the content and the theme data-* without window access', async () => {
    expect(typeof window).toBe('undefined');
    const html = await renderThemedApp(Root, true);
    const first = /<cck-badge[^>]*>/.exec(html)?.[0] ?? '';
    expect(first).toContain('class="cck-badge"');
    expect(first).toContain('data-variant="rectangle"');
    expect(first).toContain('data-cck-color="danger"');
    expect(first).toContain('data-size="lg"');
    expect(html).toContain('>5</span>');
    const dot = /<cck-badge[^>]*data-empty[^>]*>/.exec(html)?.[0] ?? '';
    expect(dot).toContain('data-cck-color="contrast"');
  });

  it('renders no theme data-* without a theme', async () => {
    expect(await renderThemedApp(Root, false)).not.toMatch(/data-variant|data-cck-color|data-size/);
  });
});
