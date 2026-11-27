import {
  Component,
  destroyPlatform,
  provideZonelessChangeDetection,
  type EnvironmentProviders,
  type Provider,
} from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckHintImports } from '@cocokits/angular/hint';
import { CckLabelImports } from '@cocokits/angular/label';
import { CckChipListImports } from '../index';

/** The app both the server and the client render: chips of the initial value, a field, a name, the facts. */
@Component({
  selector: 'app-root',
  imports: [CckChipListImports, CckFormFieldImports, CckLabelImports, CckHintImports],
  template: `
    <form>
      <cck-form-field id="dishes-field">
        <label cckLabel>Dishes</label>
        <cck-chip-list name="dish" required placeholder="Add a dish" [value]="dishes" />
        <cck-hint>Press Enter to add.</cck-hint>
      </cck-form-field>
      <cck-chip-list id="mine" aria-label="Tags" name="tag" [value]="[]" required invalid touched />
      <cck-chip-list aria-label="Locked" disabled [value]="['Locked']" />
    </form>
  `,
})
export class Root {
  protected readonly dishes = ['Pizza', 'Salad'];
}

const document = '<html><head></head><body><app-root></app-root></body></html>';

type AnyProvider = Provider | EnvironmentProviders;

const providers = (...extra: AnyProvider[]): AnyProvider[] => [provideZonelessChangeDetection(), ...extra];

/** Renders `Root` on the server and returns the full HTML; `ngDevMode` is off during the render. */
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
          { providers: providers(provideClientHydration(), provideServerRendering()) },
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
  return bootstrapApplication(Root, { providers: providers(...(hydrate ? [provideClientHydration()] : [])) });
}
