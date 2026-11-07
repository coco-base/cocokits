import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Your own markup for the trigger of a tab, in place of the `label` text. Put the `ng-template` first inside a `cck-tab`.
 *
 * The trigger shows the template inside its label. The template gets no context. To style the selected tab, use `data-selected` on the trigger.
 *
 * @example
 * <cck-tab>
 *   <ng-template cckTabLabel><svg aria-hidden="true">…</svg> Account</ng-template>
 *   Change your name.
 * </cck-tab>
 */
@Directive({
  selector: 'ng-template[cckTabLabel]',
  exportAs: 'cckTabLabel',
})
export class CckTabLabel {
  /** The template the trigger renders. @internal */
  readonly _template = inject<TemplateRef<unknown>>(TemplateRef);
}
