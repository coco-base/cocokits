// @vitest-environment node
import '@angular/compiler';
import { Component } from '@angular/core';
import { CckSelectImports } from '@cocokits/angular/select';
import { describe, expect, it } from 'vitest';
import { CckSelectTheme } from '../src/index';
import { renderThemedApp } from './ssr-helpers';

@Component({
  selector: 'app-root',
  imports: [CckSelectImports, CckSelectTheme],
  template: `<cck-select aria-label="Dish" placeholder="Choose a dish" size="lg">
    <cck-select-option [value]="dish">Cake</cck-select-option>
  </cck-select>`,
})
class Root {
  protected readonly dish = 'Cake';
}

describe('theme select on the server', () => {
  it('has no window access and renders the size on the root', async () => {
    expect(typeof window).toBe('undefined');
    const html = await renderThemedApp(Root, true);
    expect(/<cck-select[^>]*class="cck-select"[^>]*>/.exec(html)?.[0] ?? '').toContain('data-size="lg"');
    expect(html).toContain('Choose a dish');
    expect(html).not.toContain('role="listbox"');
  });

  it('renders no theme attribute without a provider', async () => {
    const html = await renderThemedApp(Root, false);
    expect(/<cck-select[^>]*class="cck-select"[^>]*>/.exec(html)?.[0] ?? '').not.toContain('data-size');
  });
});
