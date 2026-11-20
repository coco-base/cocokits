import {
  Component,
  destroyPlatform,
  provideZonelessChangeDetection,
  type EnvironmentProviders,
  type Provider,
} from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckFieldErrorImports } from '../../field-error';
import { CckHintImports } from '../../hint';
import { CckInputImports } from '../../input';
import { CckLabelImports } from '../../label';
import { CckFormFieldImports } from '../index';

/**
 * The app both the server and the client render; the second field is written in reverse order. The last field has a
 * Hint and a FieldError inside an `@if` that is true at the first render, before static ones.
 */
@Component({
  selector: 'app-root',
  imports: [CckFormFieldImports, CckLabelImports, CckHintImports, CckFieldErrorImports, CckInputImports],
  template: `
    <cck-form-field id="ordered">
      <label cckLabel for="email">Email address</label>
      <input id="email" type="email" aria-describedby="email-hint" />
      <cck-hint id="email-hint">{{ hint }}</cck-hint>
    </cck-form-field>
    <cck-form-field id="reversed">
      <cck-hint>Help</cck-hint>
      <input id="name" />
      <label cckLabel for="name">Name</label>
    </cck-form-field>
    <cck-form-field id="bare"><input /></cck-form-field>
    <cck-form-field id="cond">
      <label cckLabel>Note</label>
      <input cckInput />
      @if (shown) {
        <cck-hint>First hint</cck-hint>
      }
      @if (shown) {
        <cck-field-error force>First error</cck-field-error>
      }
      <cck-hint>Second hint</cck-hint>
      <cck-field-error force>Second error</cck-field-error>
    </cck-form-field>
  `,
})
export class Root {
  protected readonly hint = 'We only use it for the receipt.';
  protected readonly shown = true;
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
