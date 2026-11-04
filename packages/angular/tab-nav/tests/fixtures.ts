import { Component, destroyPlatform, provideZonelessChangeDetection, type ApplicationRef } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckTabNavImports } from '../index';

/** The app both the server and the client render: one nav with an active and a disabled link, and two that link a panel. */
@Component({
  selector: 'app-root',
  imports: [CckTabNavImports],
  template: `
    <nav cckTabNav [attr.aria-label]="label">
      <a cckTabNavLink href="#overview" active>Overview</a>
      <a cckTabNavLink href="#activity">Activity</a>
      <a cckTabNavLink href="#settings" disabled>Settings</a>
    </nav>
    <nav cckTabNav aria-label="Linked" [tabPanel]="first">
      <a cckTabNavLink href="#a">A</a>
      <a cckTabNavLink href="#b" active id="link-b">B</a>
      <a cckTabNavLink href="#c">C</a>
    </nav>
    <div cckTabNavPanel #first="cckTabNavPanel" id="first-panel">First panel</div>
    <div cckTabNavPanel #second="cckTabNavPanel" id="second-panel">Second panel</div>
    <nav cckTabNav aria-label="None active" [tabPanel]="second">
      <a cckTabNavLink href="#d" disabled>D</a>
      <a cckTabNavLink href="#e">E</a>
      <a cckTabNavLink href="#f">F</a>
    </nav>
  `,
})
export class Root {
  protected readonly label = 'Project';
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

/**
 * Bootstraps `Root` on the client over the current document; `hydrate` reuses server markup.
 *
 * @param hydrate - Whether to hydrate the server markup.
 * @returns The running application.
 */
export async function bootstrapOnClient(hydrate: boolean): Promise<ApplicationRef> {
  destroyPlatform();
  return bootstrapApplication(Root, {
    providers: [provideZonelessChangeDetection(), ...(hydrate ? [provideClientHydration()] : [])],
  });
}
