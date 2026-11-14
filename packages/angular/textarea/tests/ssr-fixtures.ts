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
import { CckFieldErrorImports } from '@cocokits/angular/field-error';
import { CckFormFieldImports } from '@cocokits/angular/form-field';
import { CckHintImports } from '@cocokits/angular/hint';
import { CckInputImports } from '@cocokits/angular/input';
import { CckLabelImports } from '@cocokits/angular/label';
import { CckLeadingImports } from '@cocokits/angular/leading';
import { CckPrefixImports } from '@cocokits/angular/prefix';
import { CckSuffixImports } from '@cocokits/angular/suffix';
import { CckTrailingImports } from '@cocokits/angular/trailing';
import { CckTextareaImports } from '../index';

/** The app both the server and the client render: a Textarea and an Input with every zone and a FieldError. */
@Component({
  selector: 'app-root',
  imports: [
    ReactiveFormsModule,
    CckTextareaImports,
    CckInputImports,
    CckFormFieldImports,
    CckLabelImports,
    CckHintImports,
    CckFieldErrorImports,
    CckPrefixImports,
    CckSuffixImports,
    CckLeadingImports,
    CckTrailingImports,
  ],
  template: `
    <form [formGroup]="group">
      <cck-form-field id="message-field">
        <cck-field-error>Write a message.</cck-field-error>
        <div cckTrailing>trail</div>
        <label cckLabel>Message</label>
        <div cckSuffix>suf</div>
        <textarea cckTextarea formControlName="message" rows="4"></textarea>
        <div cckPrefix>pre</div>
        <div cckLeading>lead</div>
        <cck-hint>Be kind.</cck-hint>
        <cck-field-error force>Forced.</cck-field-error>
      </cck-form-field>
      <cck-form-field>
        <label cckLabel>Name</label>
        <input cckInput formControlName="name" />
      </cck-form-field>
    </form>
  `,
})
export class Root {
  protected readonly group = new FormGroup({
    message: new FormControl('line one\r\nline two'),
    name: new FormControl(''),
  });
}

const document = '<html><head></head><body><app-root></app-root></body></html>';

type AnyProvider = Provider | EnvironmentProviders;

const providers = (...extra: AnyProvider[]): AnyProvider[] => [provideZonelessChangeDetection(), ...extra];

/** Renders `Root` on the server and returns the full HTML (see the Input's fixture for the reasons). */
export async function renderOnServer(): Promise<string> {
  destroyPlatform();
  const flags = globalThis as { ngDevMode?: unknown };
  const devMode = flags.ngDevMode;
  const globalsBefore = Object.getOwnPropertyDescriptors(globalThis);
  flags.ngDevMode = false;
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
