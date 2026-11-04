import { Component, Injector, TemplateRef, inject, input, viewChild } from '@angular/core';
import { render } from '@testing-library/angular';
import { CCK_DIALOG_DATA, CckDialog, CckDialogImports, CckDialogRef } from '../index';

/** A dialog body with a Title, a Description and the three kinds of Close. */
@Component({
  selector: 'service-body',
  imports: [CckDialogImports],
  template: `
    <h2 cckDialogTitle>{{ label() }}</h2>
    <p cckDialogDescription>Details</p>
    <button cckDialogClose>Cancel</button>
    <button [cckDialogClose]="'saved'">Save</button>
    <form method="dialog"><button id="submit">Submit</button></form>
  `,
})
export class ServiceBody {
  readonly label = input('Body');
  readonly data = inject(CCK_DIALOG_DATA);
  readonly ref = inject(CckDialogRef);
  readonly injector = inject(Injector);
}

/** A body that only carries a name, for tests that do not need the parts. */
@Component({ selector: 'service-plain', template: `<button id="inside">Inside</button>` })
export class ServicePlain {
  readonly data = inject(CCK_DIALOG_DATA);
}

/** The app of the service tests: an opener button and a template. */
@Component({
  selector: 'service-host',
  imports: [CckDialogImports],
  providers: [],
  template: `
    <button id="opener">Open</button>
    <ng-template #tpl let-data let-ref="dialogRef"
      ><span id="tpl-data">{{ data }}</span></ng-template
    >
  `,
})
export class ServiceHost {
  readonly service = inject(CckDialog);
  readonly template = viewChild.required<TemplateRef<unknown>>('tpl');
}

/** The value, or a failed test when it is missing. */
export function must<T>(value: T | null | undefined): T {
  if (value == null) throw new Error('expected a value');
  return value;
}

/** Renders the host and focuses its opener, as a click would. */
export async function setup(): Promise<{ host: ServiceHost; opener: HTMLElement }> {
  const { fixture } = await render(ServiceHost, { routes: [{ path: '**', children: [] }] });
  const opener = must(document.getElementById('opener'));
  opener.focus();
  return { host: fixture.componentInstance, opener };
}

/** Resolves once the app is stable: effects and renders have run. */
export async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/** Waits until the `<dialog>` of the service is in the document. */
export async function dialogElement(): Promise<HTMLDialogElement> {
  for (let i = 0; i < 50; i++) {
    const element = document.querySelector<HTMLDialogElement>('dialog.cck-dialog__content');
    if (element?.open) return element;
    await settle();
  }
  throw new Error('the dialog did not open');
}

/** Presses Escape on the document the way the browser delivers it to a focused dialog. */
export function pressEscape(target: Element = document.activeElement ?? document.body): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
}

/** A press on the backdrop: a pointer press on the `<dialog>` itself, outside its box. */
export function pressBackdrop(dialog: HTMLElement): void {
  dialog.getBoundingClientRect = () => new DOMRect(100, 100, 200, 200);
  dialog.dispatchEvent(
    new MouseEvent('pointerdown', { bubbles: true, cancelable: true, composed: true, clientX: 10, clientY: 10 }),
  );
}
