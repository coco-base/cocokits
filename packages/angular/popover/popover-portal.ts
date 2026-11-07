import { DestroyRef, Directive, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { CckPortal } from '@cocokits/angular-core';
import { injectCckPopover } from './popover';

/**
 * Holds the content of the Popover. The content renders in the overlay container while the Popover is open,
 * and nowhere else; keep one root element in the template. It renders no part.
 *
 * @example
 * <ng-template cckPopoverPortal><div cckPopoverContent aria-label="Details">...</div></ng-template>
 */
@Directive({ selector: 'ng-template[cckPopoverPortal]', exportAs: 'cckPopoverPortal' })
export class CckPopoverPortal {
  private readonly template = inject<TemplateRef<void>>(TemplateRef);

  constructor() {
    const root = injectCckPopover('Portal');
    const template = this.template;
    root._template.set(template);
    // The view is created at the template's own anchor, so it is checked with the declaring view.
    inject(CckPortal).useContainer(inject(ViewContainerRef));
    inject(DestroyRef).onDestroy(() => {
      root._template.update((current) => (current === template ? null : current));
    });
  }
}
