import { DestroyRef, Directive, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { CckPortal } from '@cocokits/angular-core';
import { injectCckDialogRoot } from './dialog-root';

/**
 * Holds the content of the Dialog. The content renders in the overlay container while the Dialog is open, and
 * nowhere else; keep one root element in the template. It renders no part.
 *
 * @example
 * <ng-template cckDialogPortal><dialog cckDialogContent>...</dialog></ng-template>
 */
@Directive({ selector: 'ng-template[cckDialogPortal]', exportAs: 'cckDialogPortal' })
export class CckDialogPortal {
  private readonly template = inject<TemplateRef<void>>(TemplateRef);

  constructor() {
    const root = injectCckDialogRoot('Portal');
    const template = this.template;
    root._template.set(template);
    // The view is created at the template's own anchor, so it is checked with the declaring view.
    inject(CckPortal).useContainer(inject(ViewContainerRef));
    inject(DestroyRef).onDestroy(() => {
      root._template.update((current) => (current === template ? null : current));
    });
  }
}
