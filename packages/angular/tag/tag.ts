import { Directive } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import { getTagProps, tagAnatomy } from '@cocokits/machines/tag';

/**
 * A short label that says a status or a category, such as "Paid", "Beta" or "Owner". It is static text: it is not
 * focusable and does nothing on click. To remove or select a value, use a Chip; to show a count or a dot on an
 * element, use a Badge.
 *
 * The tag has no role and no ARIA attributes, so screen readers read its text where it is. When the text changes
 * and the change must be announced, write `role="status"` on the tag yourself.
 *
 * @example
 * <cck-tag>Paid</cck-tag>
 * <cck-tag><cck-svg-icon iconName="check" />Passed</cck-tag>
 * @cckPart root
 * @cckSlot default - The text of the tag. A `cck-svg-icon` can go before or after the text. When not set, the tag is empty.
 */
@Directive({
  selector: 'cck-tag',
  exportAs: 'cckTag',
  host: {
    '[class]': 'parts.root.class',
  },
})
export class CckTag {
  protected readonly parts = getTagProps();

  constructor() {
    themeAttrs(tagAnatomy); // applies the root part's theme attributes to the host
  }
}
