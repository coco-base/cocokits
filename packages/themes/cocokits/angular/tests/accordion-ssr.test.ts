// @vitest-environment node
import '@angular/compiler';
import { Component } from '@angular/core';
import { CckAccordionImports } from '@cocokits/angular/accordion';
import { describe, expect, it } from 'vitest';
import { CckAccordionTheme } from '../src/index';
import { renderThemedApp } from './ssr-helpers';

@Component({
  selector: 'app-root',
  imports: [CckAccordionImports, CckAccordionTheme],
  template: `<cck-accordion variant="group" size="sm" togglePosition="before" hideToggle>
    <cck-accordion-item [label]="first" [expanded]="true">Orders leave in two days.</cck-accordion-item>
    <cck-accordion-item label="Returns">Send it back within 30 days.</cck-accordion-item>
  </cck-accordion>`,
})
class Root {
  protected readonly first = 'Shipping';
}

describe('theme accordion on the server', () => {
  it('has no window access and renders the options on the root', async () => {
    expect(typeof window).toBe('undefined');
    const html = await renderThemedApp(Root, true);
    const root = /<cck-accordion[^>]*class="cck-accordion"[^>]*>/.exec(html)?.[0] ?? '';
    for (const part of [
      'data-variant="group"',
      'data-size="sm"',
      'data-toggle-position="before"',
      'data-hide-toggle=""',
    ]) {
      expect(root).toContain(part);
    }
  });

  it('renders the open item open and writes no size variable', async () => {
    const html = await renderThemedApp(Root, true);
    expect(html).toContain('aria-expanded="true"');
    expect(html).not.toContain('--accordion-content');
  });

  it('renders no theme attribute without a provider', async () => {
    const html = await renderThemedApp(Root, false);
    expect(/<cck-accordion[^>]*class="cck-accordion"[^>]*>/.exec(html)?.[0] ?? '').not.toContain('data-variant');
  });
});
