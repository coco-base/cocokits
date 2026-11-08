import {
  Component,
  destroyPlatform,
  provideZonelessChangeDetection,
  signal,
  type EnvironmentProviders,
  type Provider,
} from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckHintImports } from '@cocokits/angular/hint';
import { CckLabelImports } from '@cocokits/angular/label';
import { CckRadioImports } from '@cocokits/angular/radio';
import { CckSwitchImports } from '@cocokits/angular/switch';
import { CckCheckboxImports } from '../index';

/** The app both the server and the client render: every control, alone and in a field, with every state. */
@Component({
  selector: 'app-root',
  imports: [
    CckCheckboxImports,
    CckSwitchImports,
    CckRadioImports,
    CckFormFieldImports,
    CckLabelImports,
    CckHintImports,
  ],
  template: `
    <cck-form-field id="news" required>
      <label cckLabel>Newsletter</label>
      <cck-checkbox [checked]="true" name="news" submitValue="yes">Email me</cck-checkbox>
      <cck-hint>Weekly only.</cck-hint>
    </cck-form-field>
    <cck-form-field id="push">
      <label cckLabel>Push</label>
      <cck-switch name="push">Notify me</cck-switch>
    </cck-form-field>
    <cck-checkbox id="mixed" [indeterminate]="true" aria-describedby="note">All</cck-checkbox>
    <cck-checkbox disabled>Disabled</cck-checkbox>
    <cck-checkbox readonly [checked]="checked()">Read-only</cck-checkbox>
    <cck-switch [checked]="true" required>On</cck-switch>
    <fieldset>
      <legend>Plan</legend>
      <cck-radio name="plan" submitValue="free" [checked]="true">Free</cck-radio>
      <cck-radio name="plan" submitValue="pro">Pro</cck-radio>
    </fieldset>
    <p id="note">A note</p>
  `,
})
export class Root {
  protected readonly checked = signal(true);
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
