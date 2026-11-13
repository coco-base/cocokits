import { Directive, booleanAttribute, computed, input } from '@angular/core';
import { themeAttrs } from '@cocokits/angular-core';
import {
  dividerAnatomy,
  getDividerProps,
  type DividerOrientation as MachineDividerOrientation,
} from '@cocokits/machines/divider';

/**
 * The direction of the line.
 *
 * @cckValue horizontal - A line across the container, between stacked blocks.
 * @cckValue vertical - A line down the container, between the items of a row.
 */
export type DividerOrientation = MachineDividerOrientation;

/**
 * A thin line that separates content: between stacked blocks (horizontal) or between the items of a row (vertical).
 *
 * Put `cckDivider` on a native `<hr>`. The element is always an `hr`, so assistive technology reads it as a separator with no extra ARIA. A vertical divider adds `aria-orientation="vertical"`. The divider has no margin: the layout around it, such as a `gap`, gives the space.
 *
 * Do not write your own `role`: use `decorative` instead. The directive owns the `role` attribute, so a `role` you write is replaced, and removed while the divider is not decorative.
 *
 * An `hr` is flow content. It is not valid inside a `p`, `span`, `button` or `label`, or directly inside a `ul` or `ol`; inside a list, write `<li role="separator">` yourself.
 *
 * @example
 * <hr cckDivider />
 * <hr cckDivider orientation="vertical" />
 * @cckPart root
 */
@Directive({
  selector: 'hr[cckDivider]',
  exportAs: 'cckDivider',
  host: {
    '[class]': 'parts().root.class',
    '[attr.data-orientation]': 'parts().root["data-orientation"]',
    '[attr.role]': 'parts().root.role ?? null',
    '[attr.aria-orientation]': 'parts().root["aria-orientation"] ?? null',
  },
})
export class CckDivider {
  /**
   * The direction of the line. A `horizontal` line runs across its container; a `vertical` line runs down it, so put it in a row.
   * @defaultValue 'horizontal'
   */
  readonly orientation = input<DividerOrientation>('horizontal');

  /**
   * Whether the line is purely visual. A decorative divider has `role="none"` and leaves the accessibility tree.
   * @remarks Use it where the line only repeats a grouping that headings, lists or landmarks already give. Set this input; do not write your own `role`. An `aria-label` keeps a decorative divider in the accessibility tree, so give it none.
   * @defaultValue false
   */
  readonly decorative = input(false, { transform: booleanAttribute });

  protected readonly parts = computed(() =>
    getDividerProps({ orientation: this.orientation(), decorative: this.decorative() }),
  );

  /** The theme attributes of the root; they are applied to the host. */
  protected readonly theme = themeAttrs(dividerAnatomy);
}
