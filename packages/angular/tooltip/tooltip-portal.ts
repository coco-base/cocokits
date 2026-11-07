import { DestroyRef, Directive, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { CckPortal } from '@cocokits/angular-core';
import { injectCckTooltip } from './tooltip';

/**
 * Holds the content of the Tooltip. The content renders in the overlay container while the tooltip is shown,
 * and nowhere else; keep one root element in the template. It renders no part.
 *
 * @example
 * <ng-template cckTooltipPortal><cck-tooltip-content>Copy link</cck-tooltip-content></ng-template>
 */
@Directive({ selector: 'ng-template[cckTooltipPortal]', exportAs: 'cckTooltipPortal' })
export class CckTooltipPortal {
  private readonly template = inject<TemplateRef<void>>(TemplateRef);

  constructor() {
    const root = injectCckTooltip('Portal');
    const template = this.template;
    root._template.set(template);
    // The view is created at the template's own anchor, so it is checked with the declaring view.
    inject(CckPortal).useContainer(inject(ViewContainerRef));
    inject(DestroyRef).onDestroy(() => {
      root._template.update((current) => (current === template ? null : current));
    });
  }
}
