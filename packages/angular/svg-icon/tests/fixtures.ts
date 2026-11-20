import {
  Component,
  destroyPlatform,
  provideZonelessChangeDetection,
  type EnvironmentProviders,
  type Provider,
} from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { provideCckIcons } from '@cocokits/angular-core';
import { checkIcon, heartIcon, type Icon } from '@cocokits/icons';
import { CckSvgIconImports } from '../index';

/** A small icon set built from pack icons: one path, and two paths. */
export const testIcons: Readonly<Record<string, Icon>> = {
  heart: heartIcon,
  check: checkIcon,
  pair: { viewBox: '0 0 10 10', body: `${heartIcon.body}${checkIcon.body}` },
};

/** A full SVG string of a pack icon, for the `svg` input. */
export const checkSvg = `<svg viewBox="${checkIcon.viewBox}">${checkIcon.body}</svg>`;

/** The app both the server and the client render. */
@Component({
  selector: 'app-root',
  imports: [CckSvgIconImports],
  template: `
    <cck-svg-icon iconName="heart" />
    <cck-svg-icon iconName="pair" label="Pair" />
    <cck-svg-icon iconName="missing" />
  `,
})
export class Root {
  readonly root = true;
}

const document = '<html><head></head><body><app-root></app-root></body></html>';

type AnyProvider = Provider | EnvironmentProviders;

const providers = (...extra: AnyProvider[]): AnyProvider[] => [
  provideZonelessChangeDetection(),
  provideCckIcons({ icons: testIcons }),
  ...extra,
];

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
