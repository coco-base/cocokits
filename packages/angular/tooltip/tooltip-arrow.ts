import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, inject } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import { injectCckTooltip } from './tooltip';

/**
 * The pointer from the content to the trigger: a decorative element that holds a triangle `svg`. Put it on
 * the `cck-tooltip-arrow` tag inside `cck-tooltip-content`; the one-attribute form has no
 * content template to hold it. CocoKits places it on the content edge that faces the trigger, centred on the
 * trigger and turned to point at it, and adds its height to the gap between the trigger and the content. It
 * gets the native `hidden` attribute while it cannot point at the trigger (the content has shifted along the
 * edge). Children replace the triangle and must be SVG elements, such as a `polygon`. An element that is not
 * an HTML element, such as an `svg`, is not hidden by `hidden`: hide it with CSS.
 *
 * @example
 * <cck-tooltip-content><cck-tooltip-arrow></cck-tooltip-arrow>Copy link</cck-tooltip-content>
 * @cckPart arrow
 * @cckSlot default - Replaces the triangle with SVG shapes.
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
