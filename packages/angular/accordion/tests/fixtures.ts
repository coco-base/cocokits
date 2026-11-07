import { Component, destroyPlatform, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckAccordionImports } from '../index';

/** The app both the server and the client render: single and multi accordions with open, disabled and templated items. */
@Component({
  selector: 'app-root',
  imports: [CckAccordionImports],
  template: `
    <div cckAccordion>
      <div cckAccordionItem label="Shipping">Shipping body</div>
      <div cckAccordionItem label="Returns" [expanded]="true">Returns body</div>
      <div cckAccordionItem label="Warranty" [expanded]="true">Warranty body</div>
    </div>
    <div cckAccordion multi>
      <div cckAccordionItem headingLevel="2" [expanded]="true">
        <ng-template cckAccordionLabel><b>Care</b> guide</ng-template>
        Care body
      </div>
      <div cckAccordionItem label="Locked" disabled>Locked body</div>
    </div>
  `,
})
export class Root {
  protected readonly note = 'Accordion';
}

const document = '<html><head></head><body><app-root></app-root></body></html>';

/**
 * Renders `Root` on the server and returns the full HTML. The dev-mode renderer reads `document`, so
 * `ngDevMode` is off during the render, and the DOM globals the server platform overwrites are restored.
 */
export async function renderOnServer(): Promise<string> {
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
          { providers: [provideZonelessChangeDetection(), provideClientHydration(), provideServerRendering()] },
          context,
        ),
      { document },
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

/** Bootstraps `Root` on the client over the current document; `hydrate` reuses server markup. */
export function bootstrapOnClient(hydrate: boolean): ReturnType<typeof bootstrapApplication> {
  destroyPlatform();
  return bootstrapApplication(Root, {
    providers: [provideZonelessChangeDetection(), ...(hydrate ? [provideClientHydration()] : [])],
  });
}
