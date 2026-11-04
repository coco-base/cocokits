import {
  Component,
  destroyPlatform,
  provideZonelessChangeDetection,
  type EnvironmentProviders,
  type Provider,
} from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckBadgeContainerImports } from '../../badge-container';
import { CckButtonImports } from '../../button';
import { CckBadgeImports } from '../index';

/** The app both the server and the client render. */
@Component({
  selector: 'app-root',
  imports: [CckBadgeImports, CckBadgeContainerImports, CckButtonImports],
  template: `
    <span cckBadge [content]="count"></span>
    <span cckBadge></span>
    <span cckBadge [content]="120" [max]="99"></span>
    <span cckBadge [content]="5" hide></span>
    <div cckBadgeContainer position="bottom-left">
      <span cckBadge [content]="2"></span>
      <button cckButton>Inbox</button>
    </div>
  `,
})
export class Root {
  protected readonly count = 5;
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
