import { DestroyRef, Directive, ElementRef, computed, inject, input } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import { injectCckDialogRoot } from './dialog-root';

/**
 * The heading that names the Dialog. Put it on the heading you choose; the content is labelled by it with
 * `aria-labelledby` while it is mounted.
 *
 * @example
 * <h2 cckDialogTitle>Delete project</h2>
 * @cckPart title
 * @cckSlot default - The title text.
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
   * The id of the heading; the content's `aria-labelledby` follows it.
   * @defaultValue generated
   * @remarks React and Vue: the Title's id is generated.
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
