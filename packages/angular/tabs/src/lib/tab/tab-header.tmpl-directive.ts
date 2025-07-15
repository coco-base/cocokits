import { Directive } from '@angular/core';

export interface AccordionHeaderIconContext {
  selected: boolean;
}

@Directive({
  selector: 'ng-template[cckTabHeader]',
})
export class TabHeaderTemplateDirective {
  static ngTemplateContextGuard(_dir: TabHeaderTemplateDirective, ctx: unknown): ctx is AccordionHeaderIconContext {
    return true;
  }
}
