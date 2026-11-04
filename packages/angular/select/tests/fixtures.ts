import { Component, destroyPlatform, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckSelectImports } from '../index';

/** The app both the server and the client render: a Select with a value and a name, and a multiple one. */
@Component({
  selector: 'app-root',
  imports: [CckSelectImports],
  template: `
    <form>
      <div cckSelect aria-label="Dish" name="dish" [value]="'Pizza'" placeholder="Choose">
        <div cckSelectOption value="Cake">Cake</div>
        <div cckSelectOption value="Pizza">Pizza</div>
      </div>
      <div cckSelect aria-label="Side" multiple [value]="side">
        <div cckSelectOption value="Rice">Rice</div>
      </div>
    </form>
  `,
})
export class Root {
  protected readonly side = ['Rice'];
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
