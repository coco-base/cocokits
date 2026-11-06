import { DestroyRef, Directive, ElementRef, computed, inject } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import { injectCckPopover } from './popover';

/**
 * An optional element the content is placed against instead of the trigger. Put it on any element inside the
 * root. It has no role and no ARIA: it only changes where the content goes. The trigger keeps `aria-expanded`
 * and gets focus back, and only the trigger and the content count as inside for an outside press.
 *
 * @example
 * <div cckPopoverAnchor>
 *   <button cckPopoverTrigger>Share</button>
 * </div>
 * @cckPart anchor
 * @cckSlot default - Anything.
 * @remarks With several anchors the last one mounted is used.
 * @cckParity React and Vue can also place the content against a virtual element; Angular cannot.
 */
@Directive({
  selector: '[cckPopoverAnchor]',
  exportAs: 'cckPopoverAnchor',
  host: { '[class]': 'props().class' },
})
export class CckPopoverAnchor {
  private readonly root = injectCckPopover('Anchor');
  protected readonly props = computed(() => this.root._parts().anchor);

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    this.root._anchor.set(element);
    inject(DestroyRef).onDestroy(() => {
      this.root._anchor.update((current) => (current === element ? null : current));
    });
    bindAttrs(element, () => this.root._theme().anchor);
  }
}
