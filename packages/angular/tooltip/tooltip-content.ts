import { DestroyRef, Directive, ElementRef, computed, inject, input } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import { injectCckTooltip } from './tooltip';

/**
 * The rich content of the tooltip. It has the `tooltip` role and never takes the focus. It shows in the overlay container, not next to the trigger.
 *
 * The content opens on the preferred side, and moves to the other side when there is no room. It stays open while the pointer is over it. Do not put interactive content in it.
 *
 * @example
 * <ng-template cckTooltipPortal>
 *   <cck-tooltip-content side="bottom"><b>Copy</b> the link</cck-tooltip-content>
 * </ng-template>
 * @cckPart content
 * @cckTemplate ng-template[cckTooltipPortal]
 * @cckSlot default - The content of the tooltip. When not set, the tooltip is empty.
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
   * The side of the trigger where the content prefers to open. `start` and `end` follow the text direction. The content opens on the other side when there is no room.
   * @defaultValue 'top'
   */
  readonly side = input<OverlaySide>('top');

  /**
   * How the content lines up with the edge of the trigger.
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
