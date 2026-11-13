// @vitest-environment node
import { Component, destroyPlatform, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { provideCckTheme } from '@cocokits/angular-core';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { CckAccordionImports } from '../index';

@Component({
  selector: 'app-root',
  imports: [CckAccordionImports],
  template: `
    <cck-accordion>
      <cck-accordion-item label="Shipping">Shipping body</cck-accordion-item>
    </cck-accordion>
  `,
})
class Root {
  readonly root = true;
}

const themeConfig = defineThemeConfig({
  name: 'test',
  components: {},
  icons: { 'chevron-down': { viewBox: '0 0 24 24', paths: [{ d: 'M-chevron' }] } },
  partIconNames: { accordion: { indicator: 'chevron-down' } },
});

async function renderOnServer(): Promise<string> {
  destroyPlatform();
  const flags = globalThis as { ngDevMode?: unknown };
  const devMode = flags.ngDevMode;
  const globalsBefore = Object.getOwnPropertyDescriptors(globalThis);
  flags.ngDevMode = false;
  try {
    return await renderApplication(
      (context) =>
        bootstrapApplication(
          Root,
          {
            providers: [
              provideZonelessChangeDetection(),
              provideCckTheme(themeConfig),
              provideClientHydration(),
              provideServerRendering(),
            ],
          },
          context,
        ),
      { document: '<html><head></head><body><app-root></app-root></body></html>' },
    );
  } finally {
    flags.ngDevMode = devMode;
    for (const [name, before] of Object.entries(globalsBefore)) {
      if (Object.getOwnPropertyDescriptor(globalThis, name)?.value !== before.value) {
        Object.defineProperty(globalThis, name, before);
      }
    }
  }
}

describe('Accordion indicator on the server', () => {
  it('ends the trigger with the decorative indicator that holds the theme icon', async () => {
    const html = (await renderOnServer()).replace(/<!--[^>]*-->/g, '');
    const trigger = /<button\b[^>]*class="cck-accordion__trigger"[^>]*>.*?<\/button>/.exec(html)?.[0] ?? '';
    expect(trigger).toMatch(/Shipping\s*<span[^>]*class="cck-accordion__indicator"[^>]*aria-hidden="true"[^>]*>/);
    expect(trigger).toContain('data-icon-name="chevron-down"');
    expect(trigger).toContain('d="M-chevron"');
    expect(trigger).toMatch(/<\/svg>\s*<\/cck-svg-icon>\s*<\/span>\s*<\/button>$/);
  });
});
