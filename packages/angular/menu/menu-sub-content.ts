import { Directive } from '@angular/core';
import type { OverlayAlign, OverlaySide } from '@cocokits/cdk/positioning';
import { CckMenuContentBase } from './menu-content';

/**
 * The panel of a submenu, a `menu` that does not block the page. It shows in the overlay container, next to the sub-trigger. The sub-trigger names it, unless you give it an `aria-label` or an `aria-labelledby`.
 *
 * It opens at the bottom end corner of the sub-trigger. When there is no room, it opens on the start side, and then above. On open by the keyboard, the focus moves to the first item.
 *
 * @example
 * <ng-template cckMenuPortal>
 *   <cck-menu-sub-content>
 *     <cck-menu-item>Email</cck-menu-item>
 *   </cck-menu-sub-content>
 * </ng-template>
 * @cckPart subContent
 * @cckTemplate ng-template[cckMenuPortal]
 * @cckSlot default - The items and the dividers. When not set, the panel is empty.
 */
@Directive({
  selector: 'cck-menu-sub-content',
  exportAs: 'cckMenuSubContent',
})
export class CckMenuSubContent extends CckMenuContentBase {
  protected override readonly themePart = 'subContent';

  protected wantedSide(): OverlaySide {
    return 'bottom';
  }

  protected wantedAlign(): OverlayAlign {
    return 'start';
  }
}
