import { Component, ViewEncapsulation, booleanAttribute, computed, input, numberAttribute } from '@angular/core';
import { CckAttrs, themeAttrs } from '@cocokits/angular-core';
import { badgeAnatomy, getBadgeProps } from '@cocokits/machines/badge';

/**
 * A count, a short text or an empty badge. It renders the content part and, when the number is above
 * `max`, the max indicator (`+`) into the author's element (a `<span>` by default, inside a button
 * a phrasing element). To pin it to a corner, make it a direct child of a `[cckBadgeContainer]`; the
 * badge itself knows nothing about the position.
 * It has no role and no ARIA: the shown text is read in place, so put the meaning of an empty badge in
 * the host's name.
 *
 * @example
 * <span cckBadge [content]="5"></span>
 * @cckPart root
 * @cckPart content
 * @cckPart maxIndicator
 * @cckDataAttr data-empty - present when no text is shown
 * @cckDataAttr data-truncated - present when the content is above `max`
 */
@Component({
  selector: '[cckBadge]',
  exportAs: 'cckBadge',
  encapsulation: ViewEncapsulation.None,
  imports: [CckAttrs],
  host: {
    '[class]': 'parts().root.class',
    '[attr.data-empty]': 'parts().root["data-empty"] ?? null',
    '[attr.data-truncated]': 'parts().root["data-truncated"] ?? null',
    '[hidden]': 'parts().root.hidden ?? false',
  },
  template: `
    @if (parts().content; as content) {
      <span [class]="content.class" [cckAttrs]="theme().content">{{ content.text }}</span>
    }
    @if (parts().maxIndicator; as indicator) {
      <span [class]="indicator.class" [cckAttrs]="theme().maxIndicator">{{ indicator.text }}</span>
    }
  `,
})
export class CckBadge {
  /**
   * The count or text to show. `null`, `undefined`, an empty string and the number `0` show an empty badge.
   */
  readonly content = input<number | string | null | undefined>();

  /**
   * The largest count shown. A numeric content above it shows this value and a `+`. Unset or `0`
   * never truncates.
   */
  readonly max = input<number | undefined, unknown>(undefined, { transform: numberAttribute });

  /**
   * Whether the badge is hidden with the native `hidden` attribute and renders no content.
   * @defaultValue false
   */
  readonly hide = input(false, { transform: booleanAttribute });

  protected readonly parts = computed(() =>
    getBadgeProps({
      content: this.content(),
      max: this.max(),
      hide: this.hide(),
    }),
  );

  /** The theme attributes of every part; the root's are applied to the host. */
  protected readonly theme = themeAttrs(badgeAnatomy);
}
