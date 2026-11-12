import { Directive, computed, input } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import {
  BADGE_CONTAINER_DEFAULTS,
  badgeContainerAnatomy,
  getBadgeContainerProps,
  type BadgeContainerPosition,
} from '@cocokits/machines/badge-container';

/**
 * Pins a badge to a corner of the element it wraps. The `cck-badge` must be a direct child of the container.
 *
 * The container sets no style. The theme places the badge with `.cck-badge-container[data-position] > .cck-badge`.
 *
 * @example
 * <cck-badge-container position="top-right">
 *   <button cckButton>Inbox</button>
 *   <cck-badge [content]="2"></cck-badge>
 * </cck-badge-container>
 * @cckPart root
 * @cckSlot default - The element to mark and its `cck-badge`. When not set, the container is empty.
 */
@Directive({
  selector: 'cck-badge-container',
  exportAs: 'cckBadgeContainer',
  host: {
    '[class]': 'parts().root.class',
    '[attr.data-position]': 'parts().root["data-position"]',
  },
})
export class CckBadgeContainer {
  /**
   * The corner where the badge sits. `left` is the start side of the text direction, and `right` is the end side.
   * @defaultValue 'top-right'
   */
  readonly position = input<BadgeContainerPosition>(BADGE_CONTAINER_DEFAULTS.position);

  private readonly parts = computed(() =>
    getBadgeContainerProps({
      position: this.position(),
    }),
  );

  constructor() {
    themeAttrs(badgeContainerAnatomy); // applies the root part's theme attributes to the host
  }
}
