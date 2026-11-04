import { Component, destroyPlatform, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckTabsImports } from '../index';

/** The app both the server and the client render: one Tabs with a start value, one without, one with a label template, one that keeps content. */
@Component({
  selector: 'app-root',
  imports: [CckTabsImports],
  template: `
    <div cckTabs aria-label="Account" [selectedIndex]="1">
      <div cckTab label="Account">Account body</div>
      <div cckTab label="Password" id="password-tab"><ng-template cckTabContent>Password body</ng-template></div>
      <div cckTab label="Locked" aria-label="Locked tab">Locked body</div>
    </div>
    <div cckTabs [aria-label]="plain" orientation="vertical">
      <div cckTab label="X" disabled>X body</div>
      <div cckTab>
        <ng-template cckTabLabel><b>Y</b></ng-template
        >Y body
      </div>
    </div>
    <div cckTabs aria-label="Kept" [selectedIndex]="1" preserveContent>
      <div cckTab label="First">First body</div>
      <div cckTab label="Second">Second body</div>
    </div>
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
