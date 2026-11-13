import type { DividerOrientation as MachineDividerOrientation } from '@cocokits/machines/divider';

/**
 * The direction of the line.
 *
 * @cckValue horizontal - A line across the container, between stacked blocks.
 * @cckValue vertical - A line down the container, between the items of a row.
 */
export type DividerOrientation = MachineDividerOrientation;

/**
 * A thin line that separates content: between stacked blocks or between the items of a row. It renders a native
 * `<hr>`, so assistive technology gets the separator role with no extra ARIA.
 *
 * @remarks The element is always an `hr`: there is no `as`, no `asChild` and no slot. Native attributes fall
 * through to the `hr`. The Divider has no margin, so the layout around it, such as a `gap`, sets the space.
 *
 * Set `decorative` for a line that only repeats a grouping that headings, lists or landmarks already give. Do not
 * write your own `role`, because `decorative` sets it.
 *
 * An `hr` is flow content. It is invalid inside a `p`, `span`, `button` or `label`, and as a child of `ul` or
 * `ol`. In a list, write `<li role="separator">` yourself.
 *
 * @example
 * <Divider />
 * <Divider orientation="vertical" decorative />
 *
 * @cckPart root
 */
export interface DividerProps {
  /**
   * The direction of the line. A vertical line sets `aria-orientation="vertical"`; `data-orientation` is always set.
   *
   * @defaultValue 'horizontal'
   */
  readonly orientation?: DividerOrientation | undefined;
  /**
   * Whether the line is purely visual. A decorative line renders `role="none"` and leaves the accessibility tree.
   * Use this prop and never a `role` of your own.
   *
   * @remarks An `aria-label` keeps a decorative divider in the accessibility tree, so give it none.
   *
   * @defaultValue false
   */
  readonly decorative?: boolean | undefined;
}
