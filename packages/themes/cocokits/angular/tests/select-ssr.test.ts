// @vitest-environment node
import '@angular/compiler';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckSelectImports } from '@cocokits/angular/select';
import { describe, expect, it } from 'vitest';
import { CckSelectTheme } from '../src/index';
import { providers } from './helpers';

@Component({
  selector: 'app-root',
  imports: [CckSelectImports, CckSelectTheme],
  template: `<div cckSelect aria-label="Dish" placeholder="Choose a dish" size="lg">
    <div cckSelectOption [value]="dish">Cake</div>
  </div>`,
})
class Root {
  protected readonly dish = 'Cake';
}

const render = (themed: boolean): Promise<string> =>
  renderApplication(
    (context) =>
      bootstrapApplication(Root, { providers: [provideServerRendering(), ...(themed ? providers : [])] }, context),
    { document: '<html><body><app-root></app-root></body></html>' },
  );

describe('theme select on the server', () => {
  it('has no window access and renders the size on the root', async () => {
    expect(typeof window).toBe('undefined');
    const html = await render(true);
    expect(/<div[^>]*class="cck-select"[^>]*>/.exec(html)?.[0] ?? '').toContain('data-size="lg"');
    expect(html).toContain('Choose a dish');
    expect(html).not.toContain('role="listbox"');
  });

  it('renders no theme attribute without a provider', async () => {
    const html = await render(false);
    expect(/<div[^>]*class="cck-select"[^>]*>/.exec(html)?.[0] ?? '').not.toContain('data-size');
  });
});
