import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { Component, destroyPlatform, provideZonelessChangeDetection, type ApplicationRef } from '@angular/core';
import { bootstrapApplication, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CckDialogImports } from '../dialog';
import { stubOverlayApis } from '../dialog/tests/overlay-stubs';
import { CckPopoverImports } from '../popover';
import { CckSelectImports } from '../select';

/**
 * Every part whose click must still reach it when the click came before hydration and is replayed. The TabNav
 * link is not here: its guard has to run before the consumer's listeners, which a replay cannot order, and a
 * click on a link before hydration is the browser's own navigation, which nothing can undo afterwards.
 */
@Component({
  selector: 'app-root',
  imports: [CckDialogImports, CckPopoverImports, CckSelectImports],
  template: `
    <ng-container cckDialog>
      <button id="dialog-open" cckDialogTrigger>Open dialog</button>
      <ng-template cckDialogPortal>
        <dialog cckDialogContent [attr.aria-label]="label">
          <button id="dialog-close" cckDialogClose>Close</button>
        </dialog>
      </ng-template>
    </ng-container>
    <ng-container cckDialog>
      <button id="dialog-veto" cckDialogTrigger (click)="$event.preventDefault()">Vetoed dialog</button>
      <ng-template cckDialogPortal>
        <dialog cckDialogContent aria-label="Vetoed">Text</dialog>
      </ng-template>
    </ng-container>
    <ng-container cckPopover>
      <button id="popover-open" cckPopoverTrigger>Open popover</button>
      <ng-template cckPopoverPortal>
        <div cckPopoverContent aria-label="Share"><button id="popover-close" cckPopoverClose>Close</button></div>
      </ng-template>
    </ng-container>
    <ng-container cckPopover>
      <button id="popover-veto" cckPopoverTrigger (click)="$event.preventDefault()">Vetoed popover</button>
      <ng-template cckPopoverPortal>
        <div cckPopoverContent aria-label="Vetoed">Text</div>
      </ng-template>
    </ng-container>
    <div cckSelect aria-label="Dish">
      <div cckSelectOption value="Cake">Cake</div>
      <div cckSelectOption value="Pizza">Pizza</div>
    </div>
  `,
})
class Root {
  protected readonly label = 'App';
}

const contractSource = readFileSync(
  createRequire(import.meta.url).resolve('@angular/core/event-dispatch-contract.min.js'),
  'utf8',
);
/** The page the build tool would emit: the event contract script ahead of the app. */
const PAGE = `<html><head></head><body><app-root></app-root><script type="text/javascript" id="ng-event-dispatch-contract">${contractSource}</script></body></html>`;

/** Renders on the server with event replay; the dev-mode renderer needs `ngDevMode` off and the DOM globals restored. */
async function renderOnServer(): Promise<string> {
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
          {
            providers: [
              provideZonelessChangeDetection(),
              provideClientHydration(withEventReplay()),
              provideServerRendering(),
            ],
          },
          context,
        ),
      { document: PAGE },
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

function must<T>(value: T | null | undefined): T {
  if (value == null) throw new Error('expected a value');
  return value;
}

/**
 * Puts the server page in the document, starts the event contract from its inline script (a script set through
 * `innerHTML` does not run), clicks the elements before the client exists, then hydrates and settles.
 */
async function replay(ids: readonly string[]): Promise<ApplicationRef> {
  const html = await renderOnServer();
  document.body.innerHTML = /<body[^>]*>([\s\S]*)<\/body>/.exec(html)?.[1] ?? '';
  // Scripts set through `innerHTML` do not run: run the contract and the bootstrap call after it.
  const contract = must(document.getElementById('ng-event-dispatch-contract'));
  window.eval(must(contract.textContent));
  window.eval(must(contract.nextElementSibling?.textContent));
  document.querySelector('.cck-select__trigger')?.setAttribute('id', 'select-trigger');
  for (const id of ids) {
    must(document.getElementById(id)).dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  }
  destroyPlatform();
  const app = await bootstrapApplication(Root, {
    providers: [provideZonelessChangeDetection(), provideClientHydration(withEventReplay())],
  });
  await app.whenStable();
  return app;
}

describe('event replay', () => {
  const apps: ApplicationRef[] = [];
  beforeEach(() => {
    stubOverlayApis();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });
  afterEach(() => {
    for (const app of apps.splice(0)) app.destroy();
    document.body.innerHTML = '';
    document.documentElement.removeAttribute('style');
    vi.restoreAllMocks();
  });

  it('opens a dialog from a click that came before hydration', async () => {
    apps.push(await replay(['dialog-open']));
    expect(document.querySelector('dialog.cck-dialog__content')).not.toBeNull();
  });

  it('lets the consumer veto a replayed dialog trigger click', async () => {
    apps.push(await replay(['dialog-veto']));
    expect(document.querySelector('dialog.cck-dialog__content')).toBeNull();
  });

  it('opens a popover from a replayed click', async () => {
    apps.push(await replay(['popover-open']));
    expect(document.querySelector('.cck-popover__content')).not.toBeNull();
  });

  it('lets the consumer veto a replayed popover trigger click', async () => {
    apps.push(await replay(['popover-veto']));
    expect(document.querySelector('.cck-popover__content')).toBeNull();
  });

  it('opens a select from a replayed click on its trigger', async () => {
    apps.push(await replay(['select-trigger']));
    expect(document.querySelector('[role="listbox"]')).not.toBeNull();
  });

  it('has no Close or option to replay: the server renders overlay content nowhere', async () => {
    const html = await renderOnServer();
    expect(html).not.toContain('dialog-close');
    expect(html).not.toContain('popover-close');
    expect(html).not.toContain('role="listbox"');
  });
});
