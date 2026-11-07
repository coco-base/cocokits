import { DestroyRef, Directive, ElementRef, computed, inject, input } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import { injectCckDialogRoot } from './dialog-root';

/**
 * The heading that names the dialog. Put the attribute on a heading of the level you choose. While it is on the page, the dialog points at it with `aria-labelledby`.
 *
 * @example
 * <dialog cckDialogContent>
 *   <h2 cckDialogTitle>Delete project</h2>
 * </dialog>
 * @cckPart title
 * @cckSlot default - The text of the title. When not set, the title is empty and names nothing.
 */
@Directive({
  selector: '[cckDialogTitle]',
  exportAs: 'cckDialogTitle',
  host: {
    '[class]': 'props().class',
    '[id]': 'props().id',
  },
})
export class CckDialogTitle {
  /**
   * The `id` of the heading. The dialog points at it with `aria-labelledby`. When not set, the heading gets a generated id.
   * @cckParity Declared as an input; the directive forwards it to the element.
   * @cckSemantic none
   */
  readonly id = input<string | undefined>(undefined);
  private readonly root = injectCckDialogRoot('Title');
  protected readonly props = computed(() => this.root._parts().title);

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const id = this.id;
    this.root._titles.update((titles) => [...titles, id]);
    inject(DestroyRef).onDestroy(() => {
      this.root._titles.update((titles) => titles.filter((title) => title !== id));
    });
    bindAttrs(element, () => this.root._theme().title);
  }
}
