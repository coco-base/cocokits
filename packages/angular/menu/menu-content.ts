import { DestroyRef, Directive, ElementRef, afterNextRender, computed, inject, input } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import { hasAccessibleName } from '@cocokits/utils';
import { injectCckMenu } from './menu';

/**
 * The panel of the menu, a `menu` that does not block the page. It shows in the overlay container, not next to the trigger. The trigger names it, unless you give it an `aria-label` or an `aria-labelledby`.
 *
 * The content opens on the preferred side of the trigger, and moves to the other side when there is no room. On open, the focus moves to the first item, or to the content when it has none.
 *
 * @example
 * <ng-template cckMenuPortal>
 *   <cck-menu-content side="bottom" align="start">
 *     <cck-menu-item>Rename</cck-menu-item>
 *   </cck-menu-content>
 * </ng-template>
 * @cckPart content
 * @cckTemplate ng-template[cckMenuPortal]
 * @cckSlot default - The items and the dividers. When not set, the panel is empty.
 */
@Directive({
  selector: 'cck-menu-content',
  exportAs: 'cckMenuContent',
  host: {
    '[class]': 'props().class',
    '[id]': 'props().id',
    '[attr.role]': 'props().role',
    '[attr.tabindex]': 'props().tabIndex',
    '[attr.aria-labelledby]': 'props()["aria-labelledby"] ?? null',
    '[attr.data-state]': 'props()["data-state"]',
    '[attr.data-side]': 'props()["data-side"]',
    '[attr.data-align]': 'props()["data-align"]',
    '(keydown)': 'props().onKeyDown($event)',
  },
})
export class CckMenuContent {
  /**
   * The side of the trigger where the content prefers to open. `start` and `end` follow the text direction. The content opens on the other side when there is no room.
   * @defaultValue 'bottom'
   */
  readonly side = input<OverlaySide>('bottom');

  /**
   * How the content lines up with the edge of the trigger.
   * @defaultValue 'start'
   */
  readonly align = input<OverlayAlign>('start');

  private readonly root = injectCckMenu('Content');
  protected readonly props = computed(() => this.root._parts().content);

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    // A name the author wrote on the content wins over the trigger's.
    const named = element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby');
    const registration = { element, side: this.side, align: this.align, named };
    this.root._content.set(registration);
    inject(DestroyRef).onDestroy(() => {
      this.root._content.update((current) => (current === registration ? null : current));
    });
    bindAttrs(element, () => this.root._theme().content);
    afterNextRender(() => {
      if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;
      if (!hasAccessibleName(element)) {
        console.warn(
          'CocoKits: a MenuContent has no accessible name. Give the MenuTrigger text or an aria-label, or give the content an aria-label.',
        );
      }
    });
  }
}
