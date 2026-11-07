import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * The markup of a trigger, instead of the `label` text: put an `ng-template` first inside a `cck-accordion-item`.
 * The trigger renders it inside the button, so the template has no context.
 *
 * @example
 * <cck-accordion-item>
 *   <ng-template cckAccordionLabel><b>Returns</b> policy</ng-template>
 *   Send it back within 30 days.
 * </cck-accordion-item>
 */
@Directive({
  selector: 'ng-template[cckAccordionLabel]',
  exportAs: 'cckAccordionLabel',
})
export class CckAccordionLabel {
  /** The template the trigger renders. @internal */
  readonly _template = inject<TemplateRef<unknown>>(TemplateRef);
}
