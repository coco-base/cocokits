import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * The lazy content of a tab: put an `ng-template` inside a `cck-tab`. Its content is created the first time the
 * tab is selected and destroyed when the tab is left, unless `preserveContent` keeps it. Content written
 * directly inside the `cck-tab` is created with the tab and only attached to the page while the tab is
 * selected.
 *
 * @example
 * <cck-tab label="Report">
 *   <ng-template cckTabContent><app-report /></ng-template>
 * </cck-tab>
 */
@Directive({
  selector: 'ng-template[cckTabContent]',
  exportAs: 'cckTabContent',
})
export class CckTabContent {
  /** The template the panel renders while it has content. @internal */
  readonly _template = inject<TemplateRef<unknown>>(TemplateRef);
}
