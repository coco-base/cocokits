import { Component, destroyPlatform, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckRadioImports } from '@cocokits/angular/radio';
import { CckRadioGroupImports } from '../index';

/** The app both the server and the client render: a group with a value and a disabled radio. */
@Component({
  selector: 'app-root',
  imports: [CckRadioGroupImports, CckRadioImports],
  template: `
    <cck-radio-group aria-label="Plan" [value]="plan" required orientation="horizontal">
      <cck-radio submitValue="free">Free</cck-radio>
      <cck-radio submitValue="pro">Pro</cck-radio>
      <cck-radio submitValue="team" disabled>Team</cck-radio>
    </cck-radio-group>
  `,
})
export class Root {
  protected readonly plan = 'pro';
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
      (context) => {
        return bootstrapApplication(
          Root,
          {
            providers: [provideZonelessChangeDetection(), provideClientHydration(), provideServerRendering()],
          },
          context,
        );
      },
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
