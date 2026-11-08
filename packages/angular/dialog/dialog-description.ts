import { DestroyRef, Directive, ElementRef, computed, inject } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import { injectCckDialogRoot } from './dialog-root';

/**
 * The text that describes the dialog. While it is on the page, the dialog points at it with `aria-describedby`.
 *
 * @example
 * <dialog cckDialogContent aria-label="Delete project">
 *   <cck-dialog-description>This cannot be undone.</cck-dialog-description>
 * </dialog>
 * @cckPart description
 * @cckSlot default - The text of the description. When not set, the description is empty.
 */
@Directive({
  selector: 'cck-dialog-description',
  exportAs: 'cckDialogDescription',
  host: {
    '[class]': 'props().class',
    '[id]': 'props().id',
  },
})
export class CckDialogDescription {
  private readonly root = injectCckDialogRoot('Description');
  protected readonly props = computed(() => this.root._parts().description);

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    this.root._descriptions.update((count) => count + 1);
    inject(DestroyRef).onDestroy(() => {
      this.root._descriptions.update((count) => count - 1);
    });
    bindAttrs(element, () => this.root._theme().description);
  }
}
