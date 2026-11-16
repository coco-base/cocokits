import { Directive, ElementRef, computed, inject } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import { injectCckDialogRoot } from './dialog-root';

/**
 * The middle of the dialog. It holds the content of the dialog.
 *
 * @example
 * <dialog cckDialogContent aria-label="Delete project">
 *   <cck-dialog-body>...</cck-dialog-body>
 * </dialog>
 * @cckPart body
 * @cckSlot default - The content of the body. When not set, the body is empty.
 */
@Directive({
  selector: 'cck-dialog-body',
  exportAs: 'cckDialogBody',
  host: {
    '[class]': 'props().class',
  },
})
export class CckDialogBody {
  private readonly root = injectCckDialogRoot('Body');
  protected readonly props = computed(() => this.root._parts().body);

  constructor() {
    bindAttrs(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, () => this.root._theme().body);
  }
}
