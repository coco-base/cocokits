// @vitest-environment node
import '@angular/compiler';
import { Component } from '@angular/core';
import { CckTagImports } from '@cocokits/angular/tag';
import { describe, expect, it } from 'vitest';
import { CckTagTheme } from '../src/index';
import { renderThemedApp } from './ssr-helpers';

@Component({
  selector: 'app-root',
  imports: [CckTagImports, CckTagTheme],
  template: `
    <cck-tag variant="solid" color="success" [size]="size" dot>Paid</cck-tag>
    <cck-tag>Beta</cck-tag>
  `,
})
class Root {
  readonly size = 'lg';
}

describe('theme Tag server render', () => {
  it('contains the class, the text and the theme data-* without window access', async () => {
    expect(typeof window).toBe('undefined');
    const html = await renderThemedApp(Root, true);
    const [first = '', second = ''] = html.match(/<cck-tag[^>]*>/g) ?? [];
    expect(first).toContain('class="cck-tag"');
    expect(first).toContain('data-variant="solid"');
    expect(first).toContain('data-cck-color="success"');
    expect(first).toContain('data-size="lg"');
    expect(first).toContain('data-dot=""');
    expect(html).toContain('>Paid</cck-tag>');
    expect(second).toContain('data-variant="soft"');
    expect(second).not.toContain('data-dot');
  });

  it('renders no theme data-* without a theme', async () => {
    expect(await renderThemedApp(Root, false)).not.toMatch(/data-variant|data-cck-color|data-size|data-dot/);
  });
});
