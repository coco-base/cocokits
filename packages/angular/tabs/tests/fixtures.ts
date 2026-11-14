import { Component, destroyPlatform, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckTabsImports } from '../index';

/** The app both the server and the client render: one Tabs with a start value, one without, one with a label template, one that keeps content. */
@Component({
  selector: 'app-root',
  imports: [CckTabsImports],
  template: `
    <cck-tabs aria-label="Account" [selectedIndex]="1">
      <cck-tab label="Account">Account body</cck-tab>
      <cck-tab label="Password" id="password-tab"><ng-template cckTabContent>Password body</ng-template></cck-tab>
      <cck-tab label="Locked" aria-label="Locked tab">Locked body</cck-tab>
    </cck-tabs>
    <cck-tabs [aria-label]="plain" orientation="vertical">
      <cck-tab label="X" disabled>X body</cck-tab>
      <cck-tab>
        <ng-template cckTabLabel><b>Y</b></ng-template
        >Y body
      </cck-tab>
    </cck-tabs>
    <cck-tabs aria-label="Kept" [selectedIndex]="1" preserveContent>
      <cck-tab label="First">First body</cck-tab>
      <cck-tab label="Second">Second body</cck-tab>
    </cck-tabs>
  `,
})
export class Root {
  protected readonly plain = 'Plain';
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
