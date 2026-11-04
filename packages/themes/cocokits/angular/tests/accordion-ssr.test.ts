// @vitest-environment node
import '@angular/compiler';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { provideCckTheme } from '@cocokits/angular-core';
import { CckAccordionImports } from '@cocokits/angular/accordion';
import { cocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { describe, expect, it } from 'vitest';
import { CckAccordionTheme } from '../src/index';

@Component({
  selector: 'app-root',
  imports: [CckAccordionImports, CckAccordionTheme],
  template: `<div cckAccordion variant="group" size="sm" togglePosition="before" hideToggle>
    <div cckAccordionItem [label]="first" [expanded]="true">Orders leave in two days.</div>
    <div cckAccordionItem label="Returns">Send it back within 30 days.</div>
  </div>`,
})
class Root {
  protected readonly first = 'Shipping';
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

describe('theme accordion on the server', () => {
  it('has no window access and renders the options on the root', async () => {
    expect(typeof window).toBe('undefined');
    const html = await render(true);
    const root = /<div[^>]*class="cck-accordion"[^>]*>/.exec(html)?.[0] ?? '';
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
    const html = await render(true);
    expect(html).toContain('aria-expanded="true"');
    expect(html).not.toContain('--accordion-content');
  });

  it('renders no theme attribute without a provider', async () => {
    const html = await render(false);
    expect(/<div[^>]*class="cck-accordion"[^>]*>/.exec(html)?.[0] ?? '').not.toContain('data-variant');
  });
});
