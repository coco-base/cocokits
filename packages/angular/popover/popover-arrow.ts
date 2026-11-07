import { DestroyRef, ChangeDetectionStrategy, Component, ElementRef, computed, inject } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import { injectCckPopover } from './popover';

/**
 * The pointer from the content to the trigger: a decorative element that holds a triangle `svg`. Put it on
 * the `cck-popover-arrow` tag inside `cck-popover-content`. CocoKits places it on the
 * content edge that faces the anchor, centred on the anchor and turned to point at it, and adds its height to
 * the gap between the anchor and the content. It gets the native `hidden` attribute while it cannot point at
 * the anchor (the content has shifted along the edge). Children replace the triangle and must be SVG
 * elements, such as a `polygon`. An element that is not an HTML element, such as an `svg`, is not hidden by `hidden`: hide it with CSS.
 *
 * @example
 * <cck-popover-content aria-label="Share"><cck-popover-arrow></cck-popover-arrow>Anyone with the link can view.</cck-popover-content>
 * @cckPart arrow
 * @cckSlot default - Replaces the triangle with SVG shapes.
 */
@Component({
  selector: 'cck-popover-arrow',
  exportAs: 'cckPopoverArrow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg width="10" height="5" viewBox="0 0 30 10" preserveAspectRatio="none" style="display: block">
    <ng-content><polygon points="0,0 30,0 15,10" /></ng-content>
  </svg>`,
  host: {
    '[class]': 'props().class',
    '[attr.aria-hidden]': 'props()["aria-hidden"]',
    '[attr.hidden]': 'props().hidden ? "" : null',
  },
})
export class CckPopoverArrow {
  private readonly root = injectCckPopover('Arrow');
  protected readonly props = computed(() => this.root._parts().arrow);

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    this.root._arrow.set(element);
    inject(DestroyRef).onDestroy(() => {
      this.root._arrow.update((current) => (current === element ? null : current));
    });
    bindAttrs(element, () => this.root._theme().arrow);
  }
}
