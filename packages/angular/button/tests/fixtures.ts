import {
  Component,
  Directive,
  destroyPlatform,
  forwardRef,
  input,
  provideZonelessChangeDetection,
  signal,
  type EnvironmentProviders,
  type Provider,
} from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { provideCckTheme, provideThemeOptions } from '@cocokits/angular-core';
import { defineThemeConfig } from '@cocokits/shared';
import { CckButtonImports } from '../index';

/** The Button options of the cocokits theme, repeated here so the base tests need no theme package. */
export const testThemeConfig = defineThemeConfig({
  name: 'test',
  components: {
    button: {
      variant: {
        attrName: 'variant',
        values: ['primary', 'outline', 'light', 'basic'],
        default: 'primary',
      },
      color: { attrName: 'cck-color', values: ['brand', 'danger'], default: 'brand' },
      size: { attrName: 'size', values: ['sm', 'md', 'lg'], default: 'md' },
    },
  },
});

/** A same-selector theme directive that only provides option values, like the real one. */
@Directive({
  selector: 'button[cckButton], a[cckButton]',
  providers: [
    provideThemeOptions(
      'button',
      forwardRef(() => TestButtonTheme),
      (theme: TestButtonTheme) => ({ variant: theme.variant, color: theme.color, size: theme.size }),
    ),
  ],
})
export class TestButtonTheme {
  readonly variant = input<'primary' | 'outline' | 'light' | 'basic' | null>();
  readonly color = input<'brand' | 'danger' | null>();
  readonly size = input<'sm' | 'md' | 'lg' | null>();
}

/** The app both the server and the client render. */
@Component({
  selector: 'app-root',
  imports: [CckButtonImports, TestButtonTheme],
  template: `
    <button cckButton size="lg" (click)="clicked.update((n) => n + 1)">Save</button>
    <button cckButton disabled (click)="clicked.update((n) => n + 1)">Off</button>
    <a cckButton href="#go" color="danger">Go</a>
    <a cckButton href="#go" disabled (click)="linkClicked.update((n) => n + 1)">Off</a>
  `,
})
export class Root {
  readonly clicked = signal(0);
  readonly linkClicked = signal(0);
}

const document = '<html><head></head><body><app-root></app-root></body></html>';

type AnyProvider = Provider | EnvironmentProviders;

const providers = (...extra: AnyProvider[]): AnyProvider[] => [
  provideZonelessChangeDetection(),
  provideCckTheme(testThemeConfig),
  ...extra,
];

/**
 * Renders `Root` on the server and returns the full HTML. Two test-environment details:
 * the dev-mode renderer reads `document`, so `ngDevMode` is off during the render, like a
 * deployed server; and the server platform overwrites the DOM globals (`Event`, `Node`, ...)
 * with domino's, so the globals are restored afterwards.
 */
export async function renderOnServer(): Promise<string> {
  destroyPlatform(); // the TestBed browser platform would be reused otherwise
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
