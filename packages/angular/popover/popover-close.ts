import { Directive, ElementRef, computed, inject } from '@angular/core';
import { afterReplay, bindAttrs, listenLast } from '@cocokits/angular-core';
import { injectCckPopover } from './popover';

/**
 * A button that closes the Popover. Place it in the content. It gives no label: write one, or an
 * `aria-label` for an icon-only button.
 *
 * @example
 * <button cckPopoverClose>Close</button>
 * @cckPart close
 * @cckSlot default - The button label.
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
