import { DestroyRef, Directive, ElementRef, computed, inject } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import { injectCckPopover } from './popover';

/**
 * The text that describes the Popover. The content is described by it with `aria-describedby` while it is
 * mounted.
 *
 * @example
 * <p cckPopoverDescription>Anyone with the link can view it.</p>
 * @cckPart description
 * @cckSlot default - The description text.
 */
@Directive({
  selector: '[cckPopoverDescription]',
  exportAs: 'cckPopoverDescription',
  host: {
    '[class]': 'props().class',
    '[id]': 'props().id',
  },
})
export class CckPopoverDescription {
  private readonly root = injectCckPopover('Description');
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
