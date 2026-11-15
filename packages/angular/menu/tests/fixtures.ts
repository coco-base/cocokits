import { Component, destroyPlatform, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckMenuImports } from '../index';

/** The app both the server and the client render: one Menu that starts open, one that starts closed. */
@Component({
  selector: 'app-root',
  imports: [CckMenuImports],
  template: `
    <ng-container cckMenu [open]="startOpen">
      <button cckMenuTrigger>Actions</button>
      <ng-template cckMenuPortal>
        <cck-menu-content>
          <cck-menu-item>Rename</cck-menu-item>
          <cck-menu-item [disabled]="true">Move</cck-menu-item>
        </cck-menu-content>
      </ng-template>
    </ng-container>
    <ng-container cckMenu>
      <button cckMenuTrigger>More</button>
      <ng-template cckMenuPortal>
        <cck-menu-content aria-label="More"><cck-menu-item>Copy</cck-menu-item></cck-menu-content>
      </ng-template>
    </ng-container>
  `,
})
export class Root {
  protected readonly startOpen = true;
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
