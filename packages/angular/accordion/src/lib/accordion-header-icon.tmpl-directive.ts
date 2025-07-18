import { Directive } from '@angular/core';

export interface AccordionHeaderIconContext {
  isExpanded: boolean;
  disabled: boolean;
}

@Directive({
  selector: 'ng-template[cckAccordionHeaderIcon]',
})
export class AccordionHeaderIconTemplateDirective {
  static ngTemplateContextGuard(
    _dir: AccordionHeaderIconTemplateDirective,
    ctx: unknown
  ): ctx is AccordionHeaderIconContext {
    return true;
  }
}
