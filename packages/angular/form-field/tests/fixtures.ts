import {
  Component,
  destroyPlatform,
  provideZonelessChangeDetection,
  type EnvironmentProviders,
  type Provider,
} from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckHintImports } from '../../hint';
import { CckLabelImports } from '../../label';
import { CckFormFieldImports } from '../index';

/** The app both the server and the client render; the second field is written in reverse order. */
@Component({
  selector: 'app-root',
  imports: [CckFormFieldImports, CckLabelImports, CckHintImports],
  template: `
    <div cckFormField id="ordered">
      <label cckLabel for="email">Email address</label>
      <input id="email" type="email" aria-describedby="email-hint" />
      <div cckHint id="email-hint">{{ hint }}</div>
    </div>
    <div cckFormField id="reversed">
      <div cckHint>Help</div>
      <input id="name" />
      <label cckLabel for="name">Name</label>
    </div>
    <div cckFormField id="bare"><input /></div>
  `,
})
export class Root {
  protected readonly hint = 'We only use it for the receipt.';
}

const document = '<html><head></head><body><app-root></app-root></body></html>';

type AnyProvider = Provider | EnvironmentProviders;

const providers = (...extra: AnyProvider[]): AnyProvider[] => [provideZonelessChangeDetection(), ...extra];

/**
 * Renders `Root` on the server and returns the full HTML. The dev-mode renderer reads `document`,
 * so `ngDevMode` is off during the render, and the DOM globals the server platform overwrites are
 * restored afterwards.
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
  return bootstrapApplication(Root, {
    providers: providers(...(hydrate ? [provideClientHydration()] : [])),
  });
}
