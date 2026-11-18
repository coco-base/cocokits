import { Directive, ElementRef, computed, inject } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import { injectCckDialogRoot } from './dialog-root';

/**
 * The top of the dialog. It holds the title, and the close button when you want one there. The theme draws a divider below it.
 *
 * @example
 * <dialog cckDialogContent aria-label="Delete project">
 *   <cck-dialog-header>...</cck-dialog-header>
 * </dialog>
 * @cckPart header
 * @cckSlot default - The content of the header. When not set, the header is empty.
 */
@Directive({
  selector: 'cck-dialog-header',
  exportAs: 'cckDialogHeader',
  host: {
    '[class]': 'props().class',
  },
})
export class CckDialogHeader {
  private readonly root = injectCckDialogRoot('Header');
  protected readonly props = computed(() => this.root._parts().header);

  constructor() {
    bindAttrs(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, () => this.root._theme().header);
  }
}
