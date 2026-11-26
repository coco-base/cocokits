import { DestroyRef, Directive, TemplateRef, ViewContainerRef, inject, signal } from '@angular/core';
import { injectCckDialogRoot } from './dialog-root';

/**
 * Holds the content of a dialog without a trigger, inside an `ng-container cckDialog`. The content shows in the
 * overlay container only while the dialog is open. A dialog with a trigger takes its template from
 * `cckDialogTriggerFor` instead.
 *
 * Keep one root element, the `<dialog cckDialogContent>`, in the template. The template makes no part of its own.
 * It is in `CckDialogImports` only, not exported, until the root of a dialog without a trigger sits on its own
 * template.
 *
 * @example
 * <ng-container cckDialog [(open)]="renaming">
 *   <ng-template cckDialogPortal><dialog cckDialogContent aria-label="Rename">...</dialog></ng-template>
 * </ng-container>
 * @internal
 */
@Directive({ selector: 'ng-template[cckDialogPortal]', exportAs: 'cckDialogPortal' })
export class CckDialogPortal {
  private readonly root = injectCckDialogRoot('Portal');
  private readonly template = signal<TemplateRef<unknown> | undefined>(inject(TemplateRef));

  constructor() {
    const template = this.template;
    this.root._template = template;
    // The view is created at the template's own anchor, so it is checked with the declaring view.
    this.root._portal.useContainer(inject(ViewContainerRef));
    inject(DestroyRef).onDestroy(() => {
      template.set(undefined);
    });
  }
}
