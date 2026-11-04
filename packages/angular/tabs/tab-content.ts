import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * The lazy content of a tab: put an `ng-template` inside a `cckTab`. Its content is created the first time the
 * tab is selected and destroyed when the tab is left, unless `preserveContent` keeps it. Content written
 * directly inside the `cckTab` is created with the tab and only attached to the page while the tab is
 * selected.
 *
 * @example
 * <div cckTab label="Report">
 *   <ng-template cckTabContent><app-report /></ng-template>
 * </div>
 */
@Directive({
  selector: 'ng-template[cckTabContent]',
  exportAs: 'cckTabContent',
})
export class CckTabContent {
  /** The template the panel renders while it has content. @internal */
  readonly _template = inject<TemplateRef<unknown>>(TemplateRef);
}
