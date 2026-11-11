import { DestroyRef, Directive, ElementRef, afterNextRender, computed, inject, input } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import { hasAccessibleName } from '@cocokits/utils';
import { injectCckPopover } from './popover';
import { CCK_POPOVER_DEFAULT_OPTIONS } from './popover-default-options';

/**
 * The panel of the popover, a `dialog` that does not block the page. It shows in the overlay container, not next to the trigger. Name it with `aria-label`, `aria-labelledby` or a `cckPopoverTitle`.
 *
 * The content opens on the preferred side of the trigger, and moves to the other side when there is no room. On open, the focus moves to its first focusable element, or to the content.
 *
 * @example
 * <ng-template cckPopoverPortal>
 *   <cck-popover-content side="top" aria-label="Share this page">Anyone with the link can view it.</cck-popover-content>
 * </ng-template>
 * @cckPart content
 * @cckTemplate ng-template[cckPopoverPortal]
 * @cckSlot default - The content of the panel. When not set, the panel is empty.
 * @cckDataAttr data-state - `open` or `closed`
 * @cckDataAttr data-side - the resolved side: `top`, `bottom`, `start` or `end`
 * @cckDataAttr data-align - the resolved alignment: `start`, `center` or `end`
 */
@Directive({
  selector: 'cck-popover-content',
  exportAs: 'cckPopoverContent',
  host: {
    '[class]': 'props().class',
    '[id]': 'props().id',
    '[attr.role]': 'props().role',
    '[attr.tabindex]': 'props().tabIndex',
    '[attr.aria-labelledby]': 'authorLabelledby ?? props()["aria-labelledby"] ?? null',
    '[attr.aria-describedby]': 'authorDescribedby ?? props()["aria-describedby"] ?? null',
    '[attr.data-state]': 'props()["data-state"]',
    '[attr.data-side]': 'props()["data-side"]',
    '[attr.data-align]': 'props()["data-align"]',
  },
})
export class CckPopoverContent {
  /**
   * The side of the trigger where the content prefers to open. `start` and `end` follow the text direction. The content opens on the other side when there is no room.
   * @defaultValue 'bottom'
   * @remarks `CCK_POPOVER_DEFAULT_OPTIONS` can change the default.
   */
  readonly side = input<OverlaySide>(inject(CCK_POPOVER_DEFAULT_OPTIONS).side);

  /**
   * How the content lines up with the edge of the trigger.
   * @defaultValue 'center'
   * @remarks `CCK_POPOVER_DEFAULT_OPTIONS` can change the default.
   */
  readonly align = input<OverlayAlign>(inject(CCK_POPOVER_DEFAULT_OPTIONS).align);

  private readonly root = injectCckPopover('Content');
  protected readonly props = computed(() => this.root._parts().content);
  /** An `aria-labelledby` or `aria-describedby` the author wrote wins over the Title and Description. */
  protected readonly authorLabelledby =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.getAttribute('aria-labelledby');
  protected readonly authorDescribedby =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.getAttribute('aria-describedby');

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const registration = { element, side: this.side, align: this.align };
    this.root._content.set(registration);
    inject(DestroyRef).onDestroy(() => {
      this.root._content.update((current) => (current === registration ? null : current));
    });
    bindAttrs(element, () => this.root._theme().content);
    afterNextRender(() => {
      if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;
      if (!hasAccessibleName(element)) {
        console.warn(
          'CocoKits: a PopoverContent has no accessible name. Add a cckPopoverTitle with text, or an aria-label, or an aria-labelledby that points to an element with text, to the <cck-popover-content>.',
        );
      }
    });
  }
}
