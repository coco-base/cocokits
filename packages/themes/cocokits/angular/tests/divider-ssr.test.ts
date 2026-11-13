// @vitest-environment node
import '@angular/compiler';
import { Component } from '@angular/core';
import { CckDividerImports } from '@cocokits/angular/divider';
import { describe, expect, it } from 'vitest';
import { CckDividerTheme } from '../src/index';
import { renderThemedApp } from './ssr-helpers';

@Component({
  selector: 'app-root',
  imports: [CckDividerImports, CckDividerTheme],
  template: `
    <hr cckDivider [size]="size" color="dark" orientation="vertical" />
    <hr cckDivider />
  `,
})
class Root {
  readonly size = 'lg';
}

describe('theme Divider server render', () => {
  it('contains the class and the theme data-* without window access', async () => {
    expect(typeof window).toBe('undefined');
    const html = await renderThemedApp(Root, true);
    const [first = '', second = ''] = html.match(/<hr[^>]*>/g) ?? [];
    expect(first).toContain('class="cck-divider"');
    expect(first).toContain('data-orientation="vertical"');
    expect(first).toContain('data-size="lg"');
    expect(first).toContain('data-color="dark"');
    expect(second).toContain('data-size="md"');
    expect(second).toContain('data-color="default"');
  });

  it('renders no theme data-* without a theme', async () => {
    expect(await renderThemedApp(Root, false)).not.toMatch(/data-size|data-color/);
  });
});
