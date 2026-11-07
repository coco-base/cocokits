import { DestroyRef, Directive, ElementRef, computed, inject } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import { injectCckPopover } from './popover';

/**
 * An element that the content lines up with, in place of the trigger. Put the attribute on any element inside the root. It only changes where the content shows.
 *
 * The anchor has no role and no ARIA attributes. The trigger keeps `aria-expanded` and gets the focus back. A press on the anchor still counts as a press outside.
 *
 * @example
 * <ng-container cckPopover>
 *   <div cckPopoverAnchor>
 *     <button cckPopoverTrigger type="button">Share</button>
 *   </div>
 * </ng-container>
 * @cckPart anchor
 * @cckSlot default - Any content. When not set, the anchor is empty.
 * @remarks With more than one anchor, the content lines up with the last one.
 * @cckParity Places the content against an element only; there is no virtual anchor.
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
