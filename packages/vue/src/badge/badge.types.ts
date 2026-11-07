import type { Component } from 'vue';
import type { BadgeProps as MachineBadgeProps } from '@cocokits/machines/badge';
import type { AsTag } from '@cocokits/vue-core';

/**
 * A count or a short text, shown on or next to another element. It renders a `<span>`, so it is valid inside a
 * `<button>`. Native attributes fall through to the root.
 *
 * A `BadgeContainer` pins the Badge to a corner when the Badge is a direct child of the container.
 *
 * The Badge has no role. Its text is read in place, so inside a Button it becomes part of the name of the button.
 * An empty Badge has no text. Put the meaning in the name of the host, for example
 * `aria-label="Notifications, 2 new"` on an icon-only Button.
 *
 * @example
 * <Badge :content="5" />
 *
 * @cckPart root
 */
export interface BadgeProps extends Pick<MachineBadgeProps, 'content' | 'max' | 'hide'> {
  /**
   * The tag or component to render. Keep a phrasing element, so the Badge stays valid inside a `<button>`. It is
   * ignored with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'span'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the Badge merges its attributes onto the one element or component child of its default slot, instead
   * of rendering an element. The Badge adds the class and the `data-*` attributes.
   *
   * The Badge renders its content and max indicator parts inside the child, in place of the children of the child.
   * While `hide` is set, it renders none.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
