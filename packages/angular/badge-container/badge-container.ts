import { Directive, computed, input } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import {
  BADGE_CONTAINER_DEFAULTS,
  badgeContainerAnatomy,
  getBadgeContainerProps,
  type BadgeContainerPosition,
} from '@cocokits/machines/badge-container';

/**
 * Pins a Badge to a corner of the element it wraps. It renders its children as written and does not
 * inspect them. The `[cckBadge]` must be a direct child of the container: the theme places it with
 * `.cck-badge-container[data-position] > .cck-badge`.
 *
 * It sets no style: the theme places the badge.
 *
 * @example
 * <div cckBadgeContainer position="top-right">
 *   <button cckButton>Inbox</button>
 *   <span cckBadge [content]="2"></span>
 * </div>
 * @cckPart root
 * @cckSlot default - The wrapped element and its Badge, projected as written.
 * @cckDataAttr data-position - the corner the badge is pinned to
 */
@Directive({
  selector: '[cckBadgeContainer]',
  exportAs: 'cckBadgeContainer',
  host: {
    '[class]': 'parts().root.class',
    '[attr.data-position]': 'parts().root["data-position"]',
  },
})
export class CckBadgeContainer {
  /**
   * The corner its badge is pinned to. `left` is the inline-start side and `right` the inline-end side.
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
