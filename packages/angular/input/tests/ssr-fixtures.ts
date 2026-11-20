import {
  Component,
  destroyPlatform,
  provideZonelessChangeDetection,
  type EnvironmentProviders,
  type Provider,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { bootstrapApplication, provideClientHydration, ɵBrowserDomAdapter } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { vi } from 'vitest';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckHintImports } from '@cocokits/angular/hint';
import { CckLabelImports } from '@cocokits/angular/label';
import { CckInputImports } from '../index';

/** The app both the server and the client render: every placement of the label, ids, forms and states. */
@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, CckInputImports, CckFormFieldImports, CckLabelImports, CckHintImports],
  template: `
    <form [formGroup]="group">
      <cck-form-field>
        <label cckLabel>Email</label>
        <input cckInput type="email" formControlName="email" />
        <cck-hint>We only use it for the receipt.</cck-hint>
      </cck-form-field>
      <cck-form-field id="street-field" required>
        <input cckInput formControlName="street" aria-describedby="note" />
        <label cckLabel>Street</label>
        <cck-hint>One</cck-hint>
        <cck-hint>Two</cck-hint>
      </cck-form-field>
      <div formGroupName="address">
        <cck-form-field><label cckLabel>City</label><input cckInput formControlName="city" /></cck-form-field>
      </div>
    </form>
    <p id="note">A note</p>
    <cck-form-field id="own"><label cckLabel>Own</label><input cckInput id="mine" disabled value="x" /></cck-form-field>
    <cck-form-field><label cckLabel>Native</label><input id="native" /></cck-form-field>
    <cck-form-field><input cckInput aria-label="Alone" required invalid touched /></cck-form-field>
  `,
})
export class Root {
  protected readonly group = new FormGroup({
    email: new FormControl('a@b.c'),
    street: new FormControl(''),
    address: new FormGroup({ city: new FormControl('') }),
  });
}

const document = '<html><head></head><body><app-root></app-root></body></html>';

type AnyProvider = Provider | EnvironmentProviders;

const providers = (...extra: AnyProvider[]): AnyProvider[] => [provideZonelessChangeDetection(), ...extra];

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
  // Under vitest the test environment's browser DOM adapter stays current during the render, and the
  // DefaultValueAccessor that formControlName creates reads the user agent from `window`.
  const userAgent = vi.spyOn(ɵBrowserDomAdapter.prototype, 'getUserAgent').mockReturnValue('Fake user agent');
  try {
    return await renderApplication(
      (context) => {
        return bootstrapApplication(
          Root,
          { providers: providers(provideClientHydration(), provideServerRendering()) },
          context,
        );
      },
      { document },
    );
  } finally {
    userAgent.mockRestore();
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
