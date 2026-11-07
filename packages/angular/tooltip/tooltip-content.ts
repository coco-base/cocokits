import { DestroyRef, Directive, ElementRef, computed, inject, input } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import { injectCckTooltip } from './tooltip';

/**
 * The bubble of the Tooltip: a `tooltip` that never takes focus. It renders in the overlay container, not next
 * to the trigger, and is positioned with flip and shift. It stays open while the pointer is over it. Keep it
 * free of interactive content.
 *
 * @example
 * <cck-tooltip-content side="bottom">Copy link</cck-tooltip-content>
 * @cckPart content
 * @cckTemplate ng-template[cckTooltipPortal]
 * @cckSlot default - The content.
 * @cckDataAttr data-state - `open` or `closed`
 * @cckDataAttr data-side - the resolved side: `top`, `bottom`, `start` or `end`
 * @cckDataAttr data-align - the resolved alignment: `start`, `center` or `end`
 */
@Directive({
  selector: 'cck-tooltip-content',
  exportAs: 'cckTooltipContent',
  host: {
    '[class]': 'props().class',
    '[id]': 'props().id',
    '[attr.role]': 'props().role',
    '[attr.aria-hidden]': 'props()["aria-hidden"]',
    '[attr.data-state]': 'props()["data-state"]',
    '[attr.data-side]': 'props()["data-side"]',
    '[attr.data-align]': 'props()["data-align"]',
    '(pointerenter)': 'props().onPointerEnter($event)',
    '(pointerleave)': 'props().onPointerLeave($event)',
  },
})
export class CckTooltipContent {
  /**
   * The side of the trigger the content prefers. `start` and `end` follow the direction; it flips when there
   * is no room.
   * @defaultValue 'top'
   */
  readonly side = input<OverlaySide>('top');

  /**
   * How the content lines up along the trigger's edge.
   * @defaultValue 'center'
   */
  readonly align = input<OverlayAlign>('center');

  private readonly root = injectCckTooltip('Content');
  protected readonly props = computed(() => this.root._parts().content);

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const registration = { element, side: this.side, align: this.align };
    this.root._content.set(registration);
    inject(DestroyRef).onDestroy(() => {
      this.root._content.update((current) => (current === registration ? null : current));
    });
    bindAttrs(element, () => this.root._theme().content);
  }
}
