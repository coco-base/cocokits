import { DestroyRef, Directive, ElementRef, computed, inject } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import { injectCckPopover } from './popover';

/**
 * The heading that names the popover. Put the attribute on a heading of the level you choose. While it is on the page, the content points at it with `aria-labelledby`.
 *
 * @example
 * <cck-popover-content>
 *   <h2 cckPopoverTitle>Share this page</h2>
 * </cck-popover-content>
 * @cckPart title
 * @cckSlot default - The text of the title. When not set, the title is empty and names nothing.
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
