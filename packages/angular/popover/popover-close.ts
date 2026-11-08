import { Directive, ElementRef, computed, inject } from '@angular/core';
import { afterReplay, bindAttrs, listenLast } from '@cocokits/angular-core';
import { injectCckPopover } from './popover';

/**
 * A button that closes the popover, on a native `<button>`. Put it inside the content. It gets no label of its own, so write one, or add `aria-label` to a button with only an icon.
 *
 * @example
 * <cck-popover-content aria-label="Share this page">
 *   <button cckPopoverClose type="button">Close</button>
 * </cck-popover-content>
 * @cckPart close
 * @cckSlot default - The label of the button. When not set, the button is empty, so name it with `aria-label`.
 */
@Directive({
  selector: 'button[cckPopoverClose]',
  exportAs: 'cckPopoverClose',
  host: {
    '[class]': 'props().class',
    '(click)': 'replayed($event)',
    '[attr.type]': 'props().type',
  },
})
export class CckPopoverClose {
  private readonly root = injectCckPopover('Close');
  protected readonly props = computed(() => this.root._parts().close);

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    bindAttrs(element, () => this.root._theme().close);
    // After the consumer's own click listeners, so their `preventDefault()` vetoes the close.
    listenLast(element, 'click', this.activate);
  }

  private readonly activate = (event: Event): void => {
    this.props().onClick(event);
  };

  /** A click made before hydration reaches only a `host` listener; `listenLast` does not see it. */
  protected replayed(event: Event): void {
    afterReplay(event, this.activate);
  }
}
