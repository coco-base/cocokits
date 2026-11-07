import { DestroyRef, Directive, ElementRef, afterNextRender, computed, inject, input } from '@angular/core';
import { bindAttrs } from '@cocokits/angular-core';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import { hasAccessibleName } from '@cocokits/utils';
import { injectCckPopover } from './popover';
import { CCK_POPOVER_DEFAULT_OPTIONS } from './popover-default-options';

/**
 * The content of the Popover: a non-modal `dialog` next to the trigger. It renders in the overlay
 * container, not next to the trigger, and is positioned with flip and shift. Name it with `aria-label` or
 * `aria-labelledby`, or add a `cckPopoverTitle`. Focus moves to its first focusable element on open, or to the content itself.
 *
 * @example
 * <div cckPopoverContent side="top" aria-label="Share this page">...</div>
 * @cckPart content
 * @cckTemplate ng-template[cckPopoverPortal]
 * @cckSlot default - The content.
 * @cckDataAttr data-state - `open` or `closed`
 * @cckDataAttr data-side - the resolved side: `top`, `bottom`, `start` or `end`
 * @cckDataAttr data-align - the resolved alignment: `start`, `center` or `end`
 */
@Directive({
  selector: '[cckPopoverContent]',
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
   * The side of the trigger the content prefers. `start` and `end` follow the direction; it flips when there
   * is no room.
   * @defaultValue 'bottom'
   * @remarks The default comes from `CCK_POPOVER_DEFAULT_OPTIONS`.
   */
  readonly side = input<OverlaySide>(inject(CCK_POPOVER_DEFAULT_OPTIONS).side);

  /**
   * How the content lines up along the trigger's edge.
   * @defaultValue 'center'
   * @remarks The default comes from `CCK_POPOVER_DEFAULT_OPTIONS`.
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
          'CocoKits: a PopoverContent has no accessible name. Add a cckPopoverTitle, or an aria-label or aria-labelledby to the element with cckPopoverContent.',
        );
      }
    });
  }
}
