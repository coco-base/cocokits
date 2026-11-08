import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import { injectCckTooltip } from './tooltip';

/**
 * A small triangle that points from the content to the trigger. It is only for the look. Put it inside the `cck-tooltip-content` of the rich form.
 *
 * The arrow sits on the edge of the content that faces the trigger, and points at the trigger. Its height adds to the gap between the trigger and the content.
 *
 * When the content moves too far along its edge, the arrow cannot point at the trigger, and it gets `hidden`. The `hidden` attribute does not hide an `svg`, so hide that with CSS.
 *
 * @example
 * <cck-tooltip-content>
 *   <cck-tooltip-arrow></cck-tooltip-arrow>
 *   Copy link
 * </cck-tooltip-content>
 * @cckPart arrow
 * @cckSlot default - Your own SVG shapes, like a `polygon`, in place of the triangle. When not set, the arrow shows a triangle.
 */
@Component({
  selector: 'cck-tooltip-arrow',
  exportAs: 'cckTooltipArrow',
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
export class CckTooltipArrow {
  private readonly root = injectCckTooltip('Arrow');
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
