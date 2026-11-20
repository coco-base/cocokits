import {
  Component,
  destroyPlatform,
  provideZonelessChangeDetection,
  type EnvironmentProviders,
  type Provider,
} from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckAvatarGroupImports } from '@cocokits/angular/avatar-group';
import { CckAvatarLabelImports } from '@cocokits/angular/avatar-label';
import { CckAvatarImports } from '../index';

/** The app both the server and the client render: every part of the three components. */
@Component({
  selector: 'app-root',
  imports: [CckAvatarImports, CckAvatarGroupImports, CckAvatarLabelImports],
  template: `
    <cck-avatar id="one">
      <img cckAvatarImage src="/a.png" alt="Ada" />
      <cck-avatar-fallback>AL</cck-avatar-fallback>
    </cck-avatar>
    <cck-avatar id="two">
      <img cckAvatarImage alt="Grace" />
      <cck-avatar-fallback delayMs="300">GH</cck-avatar-fallback>
    </cck-avatar>
    <cck-avatar-group role="group" aria-label="Team">
      <cck-avatar><cck-avatar-fallback>A</cck-avatar-fallback></cck-avatar>
      <cck-avatar><cck-avatar-fallback>B</cck-avatar-fallback></cck-avatar>
    </cck-avatar-group>
    <cck-avatar-label name="Ada Lovelace" description="Mathematician">
      <cck-avatar aria-hidden="true"><cck-avatar-fallback>AL</cck-avatar-fallback></cck-avatar>
    </cck-avatar-label>
  `,
})
export class Root {
  readonly root = true;
}

const document = '<html><head></head><body><app-root></app-root></body></html>';

type AnyProvider = Provider | EnvironmentProviders;

const providers = (...extra: AnyProvider[]): AnyProvider[] => [provideZonelessChangeDetection(), ...extra];

/** Renders `Root` on the server (`ngDevMode` off, DOM globals restored) and returns the full HTML. */
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
