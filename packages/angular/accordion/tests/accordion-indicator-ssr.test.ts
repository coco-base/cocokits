// @vitest-environment node
import { Component, destroyPlatform, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { provideCckIcons, provideCckTheme } from '@cocokits/angular-core';
import { plusIcon } from '@cocokits/icons';
import { defineThemeConfig } from '@cocokits/shared';
import { describe, expect, it } from 'vitest';
import { accordionMeta } from '@cocokits/machines/accordion';
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
  components: { accordion: { icons: { indicator: 'plus' } } },
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
              provideCckIcons({ icons: { plus: plusIcon } }),
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
    const indicator = accordionMeta.defaultElements?.indicator ?? '';
    expect(trigger).toMatch(
      new RegExp(`Shipping\\s*<${indicator}[^>]*class="cck-accordion__indicator"[^>]*aria-hidden="true"[^>]*>`),
    );
    expect(trigger).toContain('data-icon="plus"');
    expect(trigger).toContain(plusIcon.body.slice(0, 30));
    expect(trigger).toMatch(/<\/svg>\s*<\/cck-svg-icon>\s*<\/span>\s*<\/button>$/);
  });
});
