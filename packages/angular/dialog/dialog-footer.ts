import { Directive, ElementRef, computed, inject } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import { injectCckDialogRoot } from './dialog-root';

/**
 * The bottom of the dialog. It holds the actions. The theme lays them out in one row, aligned to the end, and draws a divider above it.
 *
 * @example
 * <dialog cckDialogContent aria-label="Delete project">
 *   <cck-dialog-footer>...</cck-dialog-footer>
 * </dialog>
 * @cckPart footer
 * @cckSlot default - The content of the footer. When not set, the footer is empty.
 */
@Directive({
  selector: 'cck-dialog-footer',
  exportAs: 'cckDialogFooter',
  host: {
    '[class]': 'props().class',
  },
})
export class CckDialogFooter {
  private readonly root = injectCckDialogRoot('Footer');
  protected readonly props = computed(() => this.root._parts().footer);

  constructor() {
    bindAttrs(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, () => this.root._theme().footer);
  }
}
