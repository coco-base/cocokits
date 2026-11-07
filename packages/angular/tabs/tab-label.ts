import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * The markup of a trigger, instead of the `label` text: put an `ng-template` first inside a `cck-tab`. The
 * trigger renders it inside its label, and carries `data-selected` for styling, so the template has no context.
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
