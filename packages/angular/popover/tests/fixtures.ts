import { Component, destroyPlatform, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { CckFormField } from '@cocokits/angular/form-field';
import { CckInput } from '@cocokits/angular/input';
import { CckLabel } from '@cocokits/angular/label';
import { CckSuffix } from '@cocokits/angular/suffix';
import { CckPopoverImports } from '../index';

/**
 * The app both the server and the client render: one Popover that starts open, one that starts closed, and one whose
 * trigger sits in the suffix of a form field that the anchor holds.
 */
@Component({
  selector: 'app-root',
  imports: [CckPopoverImports, CckFormField, CckLabel, CckInput, CckSuffix],
  template: `
    <div cckPopoverAnchor><button [cckPopoverTriggerFor]="popover" [open]="startOpen">Share</button></div>
    <ng-template #popover>
      <cck-popover-content>
        <cck-popover-arrow></cck-popover-arrow>
        <h2 cckPopoverTitle>Share this page</h2>
        <button cckPopoverClose>Close</button>
      </cck-popover-content>
    </ng-template>
    <button [cckPopoverTriggerFor]="popover2">Info</button>
    <ng-template #popover2>
      <cck-popover-content aria-label="Info">Text</cck-popover-content>
    </ng-template>
    <div cckPopoverAnchor data-testid="field-anchor">
      <cck-form-field>
        <label cckLabel>Tax number</label>
        <div cckSuffix><button [cckPopoverTriggerFor]="help" aria-label="What is a tax number?">?</button></div>
        <input cckInput />
      </cck-form-field>
    </div>
    <ng-template #help>
      <cck-popover-content aria-label="Tax number">The 11-digit number on your tax letter.</cck-popover-content>
    </ng-template>
  `,
})
export class Root {
  protected readonly startOpen = true;
}

const document = '<html><head></head><body><app-root></app-root></body></html>';

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
      (context) =>
        bootstrapApplication(
          Root,
          { providers: [provideZonelessChangeDetection(), provideClientHydration(), provideServerRendering()] },
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
    providers: [provideZonelessChangeDetection(), ...(hydrate ? [provideClientHydration()] : [])],
  });
}
