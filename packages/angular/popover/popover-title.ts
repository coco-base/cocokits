import { DestroyRef, Directive, ElementRef, computed, inject } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import { injectCckPopover } from './popover';

/**
 * The heading that names the Popover. Put it on the heading you choose; the content is labelled by it with
 * `aria-labelledby` while it is mounted.
 *
 * @example
 * <h2 cckPopoverTitle>Share this page</h2>
 * @cckPart title
 * @cckSlot default - The title text.
 */
@Directive({
  selector: '[cckPopoverTitle]',
  exportAs: 'cckPopoverTitle',
  host: {
    '[class]': 'props().class',
    '[id]': 'props().id',
  },
})
export class CckPopoverTitle {
  private readonly root = injectCckPopover('Title');
  protected readonly props = computed(() => this.root._parts().title);

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    this.root._titles.update((count) => count + 1);
    inject(DestroyRef).onDestroy(() => {
      this.root._titles.update((count) => count - 1);
    });
    bindAttrs(element, () => this.root._theme().title);
  }
}
