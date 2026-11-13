import {
  Component,
  destroyPlatform,
  provideZonelessChangeDetection,
  type EnvironmentProviders,
  type Provider,
} from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { provideCckTheme } from '@cocokits/angular-core';
import { defineThemeConfig, type SvgIconSet } from '@cocokits/shared';
import { CckSvgIconImports } from '../index';

/** A small icon set: one path with both rules, two paths, and the markup attack in `d`. */
export const testIcons: SvgIconSet = {
  star: {
    viewBox: '0 0 24 24',
    paths: [{ d: 'M12 2l3 7h7l-5 5 2 8-7-4-7 4 2-8-5-5h7z', fillRule: 'evenodd', clipRule: 'evenodd' }],
  },
  pair: { viewBox: '0 0 10 10', paths: [{ d: 'M0 0h5' }, { d: 'M5 5h5' }] },
  attack: { viewBox: '0 0 1 1', paths: [{ d: '"/><script>alert(1)</script><path d="' }] },
};

/** A theme that carries the test icons. */
export const testThemeConfig = defineThemeConfig({ name: 'test', components: {}, icons: testIcons });

/** The app both the server and the client render. */
@Component({
  selector: 'app-root',
  imports: [CckSvgIconImports],
  template: `
    <cck-svg-icon iconName="star" />
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
  provideCckTheme(testThemeConfig),
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
