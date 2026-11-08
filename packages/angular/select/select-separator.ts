import { Directive, ElementRef, inject } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import { injectCckSelect } from './select';

/**
 * A line between options or groups. It is decorative: assistive technology skips it, and keys never stop on it.
 *
 * @example
 * <cck-select-option value="Cake">Cake</cck-select-option>
 * <cck-select-separator></cck-select-separator>
 * <cck-select-option value="Pizza">Pizza</cck-select-option>
 * @cckPart separator
 */
@Directive({
  selector: 'cck-select-separator',
  exportAs: 'cckSelectSeparator',
  host: {
    '[class]': 'root.parts().separator.class',
    '[attr.aria-hidden]': 'root.parts().separator["aria-hidden"]',
  },
})
export class CckSelectSeparator {
  protected readonly root = injectCckSelect<unknown>('cck-select-separator');

  constructor() {
    bindAttrs(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, () => this.root._theme().separator);
  }
}
