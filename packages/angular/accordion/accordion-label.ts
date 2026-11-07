import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * The markup of a trigger, instead of the `label` text: put an `ng-template` first inside a `cckAccordionItem`.
 * The trigger renders it inside the button, so the template has no context.
 *
 * @example
 * <div cckAccordionItem>
 *   <ng-template cckAccordionLabel><b>Returns</b> policy</ng-template>
 *   Send it back within 30 days.
 * </div>
 */
@Directive({
  selector: 'ng-template[cckAccordionLabel]',
  exportAs: 'cckAccordionLabel',
})
export class CckAccordionLabel {
  /** The template the trigger renders. @internal */
  readonly _template = inject<TemplateRef<unknown>>(TemplateRef);
}
