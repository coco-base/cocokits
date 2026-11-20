import { Component, destroyPlatform, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckTooltipImports } from '../index';

/** The app both the server and the client render: a compound tooltip and three one-attribute tooltips. */
@Component({
  selector: 'app-root',
  imports: [CckTooltipImports],
  template: `
    <ng-container cckTooltip="Copy the link">
      <button cckTooltipTrigger aria-label="Copy link">Copy</button>
      <ng-template cckTooltipPortal
        ><cck-tooltip-content
          ><cck-tooltip-arrow></cck-tooltip-arrow>Copy <b>the</b> link</cck-tooltip-content
        ></ng-template
      >
    </ng-container>
    <button cckTooltip="Information" id="mine" aria-describedby="note">Info</button>
    <button cckTooltip="Save" aria-label="Save">S</button>
    <span id="note">Note</span>
  `,
})
export class Root {
  protected readonly ready = true;
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
