import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Your own markup for the trigger of an item, in place of the `label` text. Put the `ng-template` first inside a `cck-accordion-item`.
 *
 * The trigger shows the template inside its button. The template gets no context, and its markup must not be interactive.
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
