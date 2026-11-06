import { Directive, ElementRef, inject } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import { injectCckSelect } from './select';

/**
 * A line between options or groups. It is decorative: assistive technology skips it, and keys never stop on it.
 *
 * @example
 * <div cckSelectOption value="Cake">Cake</div>
 * <div cckSelectSeparator></div>
 * <div cckSelectOption value="Pizza">Pizza</div>
 * @cckPart separator
 */
@Directive({
  selector: '[cckSelectSeparator]',
  exportAs: 'cckSelectSeparator',
  host: {
    '[class]': 'root.parts().separator.class',
    '[attr.aria-hidden]': 'root.parts().separator["aria-hidden"]',
  },
})
export class CckSelectSeparator {
  protected readonly root = injectCckSelect<unknown>('Separator');

  constructor() {
    bindAttrs(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, () => this.root._theme().separator);
  }
}
