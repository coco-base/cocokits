import type { Component } from 'vue';
import type { AsTag } from '@cocokits/vue-core';

/**
 * A short label that says a status or a category, such as "Paid", "Beta" or "Owner". It renders a `<span>` of static
 * text: it is not focusable and does nothing on click.
 *
 * To remove or select a value, use a Chip; to show a count or a dot on an element, use a Badge. Native attributes
 * fall through to the root.
 *
 * The Tag has no role and no ARIA attributes, so screen readers read its text where it is. When the text changes
 * and the change must be announced, write `role="status"` on the Tag yourself.
 *
 * @example
 * <Tag>Paid</Tag>
 * <Tag><SvgIcon icon-name="check" /> Passed</Tag>
 *
 * @cckPart root
 */
export interface TagProps {
  /**
   * The tag or component to render. It is ignored with `asChild`. Keep a phrasing element, so that the Tag stays
   * valid inside a line of text.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'span'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the Tag merges its attributes onto the one element or component child of its default slot, instead of
   * rendering an element.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
