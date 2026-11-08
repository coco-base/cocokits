import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Content of a tab that is made only when the tab is selected. Put the `ng-template` inside a `cck-tab`.
 *
 * The content is made the first time the tab is selected. It is removed when the user leaves the tab, unless `preserveContent` is set. Content you write directly inside the `cck-tab` is made with the tab, and shows only while the tab is selected.
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
