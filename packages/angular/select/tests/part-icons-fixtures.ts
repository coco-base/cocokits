import {
  Component,
  destroyPlatform,
  provideZonelessChangeDetection,
  type EnvironmentProviders,
  type Provider,
} from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { provideCckIcons, provideCckTheme } from '@cocokits/angular-core';
import { CckAccordionImports } from '@cocokits/angular/accordion';
import { CckCheckboxImports } from '@cocokits/angular/checkbox';
import { heartIcon, plusIcon } from '@cocokits/icons';
import { defineThemeConfig } from '@cocokits/shared';
import { CckSelectImports } from '../index';

/** A theme that names a registered icon (not the default) for every part that holds one. */
export const partIconsTheme = defineThemeConfig({
  name: 'test',
  components: {
    select: { icons: { dropdownIcon: 'plus', optionIndicator: 'heart' } },
    accordion: { icons: { indicator: 'plus' } },
    checkbox: { icons: { background: 'heart' } },
  },
});

/** The icons the theme names, registered for the app. */
export const partIconsRegistry = provideCckIcons({ icons: { plus: plusIcon, heart: heartIcon } });

/** The app both the server and the client render: a Select, an Accordion and three Checkboxes. */
@Component({
  selector: 'app-root',
  imports: [CckSelectImports, CckAccordionImports, CckCheckboxImports],
  template: `
    <cck-select aria-label="Dish" value="Pizza">
      <cck-select-option value="Cake">Cake</cck-select-option>
      <cck-select-option value="Pizza">Pizza</cck-select-option>
    </cck-select>
    <cck-accordion>
      <cck-accordion-item label="Shipping">Rates</cck-accordion-item>
    </cck-accordion>
    <cck-checkbox [checked]="true">Checked</cck-checkbox>
    <cck-checkbox>Unchecked</cck-checkbox>
    <cck-checkbox [indeterminate]="true">Mixed</cck-checkbox>
  `,
})
export class PartIconsRoot {
  readonly root = true;
}

const document = '<html><head></head><body><app-root></app-root></body></html>';

type AnyProvider = Provider | EnvironmentProviders;

const providers = (...extra: AnyProvider[]): AnyProvider[] => [
  provideZonelessChangeDetection(),
  provideCckTheme(partIconsTheme),
  partIconsRegistry,
  ...extra,
];

/** Renders the app on the server (`ngDevMode` off, DOM globals restored) and returns the full HTML. */
export async function renderPartIconsOnServer(): Promise<string> {
  destroyPlatform();
  const flags = globalThis as { ngDevMode?: unknown };
  const devMode = flags.ngDevMode;
  const globalsBefore = Object.getOwnPropertyDescriptors(globalThis);
  flags.ngDevMode = false;
  try {
    return await renderApplication(
      (context) =>
        bootstrapApplication(
          PartIconsRoot,
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

/** Bootstraps the app on the client over the current document; `hydrate` reuses server markup. */
export function bootstrapPartIconsOnClient(hydrate: boolean): ReturnType<typeof bootstrapApplication> {
  destroyPlatform();
  return bootstrapApplication(PartIconsRoot, { providers: providers(...(hydrate ? [provideClientHydration()] : [])) });
}
