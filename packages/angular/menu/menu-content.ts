import { DestroyRef, Directive, ElementRef, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { bindAttrs, themeAttrs } from '@cocokits/angular-core';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import { menuAnatomy } from '@cocokits/machines/menu';
import { hasAccessibleName } from '@cocokits/utils';
import { injectCckMenu } from './menu-inject';

/**
 * What the menu content and the sub-content share. Not for direct use or extension outside CocoKits.
 * @internal
 */
@Directive({
  host: {
    '[attr.side]': 'null',
    '[attr.align]': 'null',
    '[class]': 'props().class',
    '[id]': 'props().id',
    '[attr.role]': 'props().role',
    '[attr.tabindex]': 'props().tabIndex',
    '[attr.aria-labelledby]': 'authorLabelledby ?? props()["aria-labelledby"] ?? null',
    '[attr.data-state]': 'props()["data-state"]',
    '[attr.data-side]': 'props()["data-side"]',
    '[attr.data-align]': 'props()["data-align"]',
    '(keydown)': 'props().onKeyDown($event)',
    '[attr.sideoffset]': 'null',
    '[attr.alignoffset]': 'null',
  },
})
export abstract class CckMenuContentBase {
  /**
   * The gap between the trigger and the content, in px. When not set, the gap is the `--side-offset` of the theme.
   * @remarks A number is px. The gap is a position, so the author can set it for each menu.
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly sideOffset = input<number | undefined>(undefined);

  /**
   * How far, in px, the content moves along the edge of the trigger, away from the aligned edge. It has no effect with `align="center"`. When not set, the content is not moved.
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  readonly alignOffset = input<number | undefined>(undefined);

  private readonly root = injectCckMenu('Content');

  /** The side the content prefers; a submenu has its own placement. */
  protected abstract wantedSide(): OverlaySide;

  /** The alignment the content prefers. */
  protected abstract wantedAlign(): OverlayAlign;

  protected readonly props = computed(() => this.root._parts().content);

  /** A static `aria-labelledby` the author wrote; it wins over the trigger's. */
  protected readonly authorLabelledby: string | null;

  /** The part whose theme options the element takes: the content, or the sub-content in a submenu. */
  protected readonly themePart: 'content' | 'subContent' = 'content';

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    this.authorLabelledby = element.getAttribute('aria-labelledby');
    // A name the author wrote on the content wins over the trigger's. A bound name appears after the first render.
    const hasName = (): boolean => element.hasAttribute('aria-label') || this.authorLabelledby !== null;
    const named = signal(hasName());
    const ready = signal(false);
    const registration = {
      element,
      side: computed(() => this.wantedSide()),
      align: computed(() => this.wantedAlign()),
      sideOffset: this.sideOffset,
      alignOffset: this.alignOffset,
      named,
      ready,
    };
    this.root._content.set(registration);
    inject(DestroyRef).onDestroy(() => {
      this.root._content.update((current) => (current === registration ? null : current));
    });
    // The content reads the theme options of its own element (a theme directive on `cck-menu-content`), not the root's.
    const theme = themeAttrs(menuAnatomy);
    bindAttrs(element, () => theme()[this.themePart]);
    afterNextRender(() => {
      ready.set(true);
      named.set(hasName());
      if (typeof ngDevMode !== 'undefined' && !ngDevMode) return;
      if (!hasAccessibleName(element)) {
        console.warn(
          'CocoKits: a MenuContent has no accessible name. Give the MenuTrigger text or an aria-label, or give the content an aria-label.',
        );
      }
    });
  }
}

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
})
export class CckMenuContent extends CckMenuContentBase {
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

  protected wantedSide(): OverlaySide {
    return this.side();
  }

  protected wantedAlign(): OverlayAlign {
    return this.align();
  }
}
