import { DestroyRef, Directive, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { CckPortal } from '@cocokits/angular-core';
import { injectCckMenu } from './menu';

/**
 * Holds the content of the menu. The content shows in the overlay container only while the menu is open.
 *
 * Keep one root element, the `cck-menu-content`, in the template. The template makes no part of its own.
 *
 * @example
 * <ng-template cckMenuPortal><cck-menu-content><cck-menu-item>Rename</cck-menu-item></cck-menu-content></ng-template>
 */
@Directive({ selector: 'ng-template[cckMenuPortal]', exportAs: 'cckMenuPortal' })
export class CckMenuPortal {
  private readonly template = inject<TemplateRef<void>>(TemplateRef);

  constructor() {
    const root = injectCckMenu('Portal');
    const template = this.template;
    root._template.set(template);
    // The view is created at the template's own anchor, so it is checked with the declaring view.
    inject(CckPortal).useContainer(inject(ViewContainerRef));
    inject(DestroyRef).onDestroy(() => {
      root._template.update((current) => (current === template ? null : current));
    });
  }
}
