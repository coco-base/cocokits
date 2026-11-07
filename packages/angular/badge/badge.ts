import { Component, ViewEncapsulation, booleanAttribute, computed, input, numberAttribute } from '@angular/core';
import { CckAttrs, themeAttrs } from '@cocokits/angular-core';
import { badgeAnatomy, getBadgeProps } from '@cocokits/machines/badge';

/**
 * A small mark that shows a count, a short text or nothing. When the count is above `max`, it shows `max` and a `+`.
 *
 * To pin the badge to a corner of an element, put it directly inside a `cck-badge-container`.
 *
 * The badge has no role and no ARIA attributes, so screen readers read its text where it is. An empty badge says nothing, so put its meaning in the name of the element it marks.
 *
 * @example
 * <cck-badge [content]="5" [max]="99"></cck-badge>
 * @cckPart root
 * @cckPart content
 * @cckPart maxIndicator
 * @cckDataAttr data-empty - present when no text is shown
 * @cckDataAttr data-truncated - present when the content is above `max`
 */
@Component({
  selector: 'cck-badge',
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
   * The count or the text to show. When not set, the badge is empty.
   * @remarks `null`, an empty string and the number `0` also show an empty badge.
   */
  readonly content = input<number | string | null | undefined>();

  /**
   * The largest count to show. A larger count shows this value and a `+`. When not set, or when `0`, every count shows in full.
   */
  readonly max = input<number | undefined, unknown>(undefined, { transform: numberAttribute });

  /**
   * Whether the badge is hidden with the native `hidden` attribute. A hidden badge shows no content.
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
