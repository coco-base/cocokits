import { DestroyRef, Directive, ElementRef, computed, inject, input } from '@angular/core';
import { afterReplay, bindAttrs, listenLast } from '@cocokits/angular-core';
import { injectCckPopover } from './popover';

/**
 * The button that toggles the Popover. Compose it with another component by placing both directives on the
 * element (`<button cckButton cckPopoverTrigger>`). Enter and Space toggle through the native click.
 *
 * @example
 * <button cckPopoverTrigger>Share</button>
 * @cckPart trigger
 * @cckSlot default - The trigger label.
 * @cckDataAttr data-state - `open` or `closed`
 */
@Directive({
  selector: 'button[cckPopoverTrigger]',
  exportAs: 'cckPopoverTrigger',
  host: {
    '[class]': 'props().class',
    '(click)': 'replayed($event)',
    '[id]': 'id() ?? props().id',
    '[attr.type]': 'props().type',
    '[attr.aria-haspopup]': 'props()["aria-haspopup"]',
    '[attr.aria-expanded]': 'props()["aria-expanded"]',
    '[attr.aria-controls]': 'props()["aria-controls"] ?? null',
    '[attr.data-state]': 'props()["data-state"]',
  },
})
export class CckPopoverTrigger {
  private readonly root = injectCckPopover('Trigger');
  protected readonly props = computed(() => this.root._parts().trigger);
  /**
   * The id of the trigger. It wins over the generated one and follows changes.
   * @defaultValue generated
   * @cckParity Declared as an input; the directive forwards it to the element.
   * @cckSemantic none
   */
  readonly id = input<string | undefined>(undefined);

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    this.root._trigger.set(element);
    inject(DestroyRef).onDestroy(() => {
      this.root._trigger.update((current) => (current === element ? null : current));
    });
    bindAttrs(element, () => this.root._theme().trigger);
    // After the consumer's own click listeners, so their `preventDefault()` vetoes the toggle.
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
