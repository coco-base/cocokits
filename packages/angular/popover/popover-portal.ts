import { DestroyRef, Directive, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { CckPortal } from '@cocokits/angular-core';
import { injectCckPopover } from './popover';

/**
 * Holds the content of the popover. The content shows in the overlay container only while the popover is open.
 *
 * Keep one root element, the `cck-popover-content`, in the template. The template makes no part of its own.
 *
 * @example
 * <ng-template cckPopoverPortal><cck-popover-content aria-label="Details">...</cck-popover-content></ng-template>
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
