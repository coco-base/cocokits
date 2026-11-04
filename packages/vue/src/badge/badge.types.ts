import type { Component } from 'vue';
import type { BadgeProps as MachineBadgeProps } from '@cocokits/machines/badge';
import type { AsTag } from '@cocokits/vue-core';

/**
 * A count or a short text, shown on or next to another element. It renders a `<span>` by default, so
 * it is valid inside a `<button>`. Native attributes fall through to the root. A `BadgeContainer`
 * pins it to a corner when it is a direct child of the container.
 *
 * It has no role. Its text is read in place, so inside a Button it becomes part of the button's
 * name. An empty badge has no text: put the meaning in the host's name, for example
 * `aria-label="Notifications, 2 new"` on an icon-only Button.
 *
 * @example
 * <Badge :content="5" />
 *
 * @cckPart root
 */
export interface BadgeProps extends Pick<MachineBadgeProps, 'content' | 'max' | 'hide'> {
  /**
   * The tag or component to render. Keep a phrasing element, so the Badge stays valid inside a `<button>`.
   *
   * @cckSemantic none
   * @remarks Vue's element override (Reka).
   * @defaultValue 'span'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the Badge merges its attributes onto the one element or component child of its default
   * slot instead of rendering an element. The Badge adds the class and the `data-*`, and
   * renders its content and max indicator parts inside the child in place of the child's own children
   * (none while `hide` is set).
   *
   * @cckSemantic none
   * @remarks Vue's merge onto one child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
