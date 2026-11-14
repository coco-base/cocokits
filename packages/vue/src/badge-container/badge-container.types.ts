import type { Component } from 'vue';
import type { BadgeContainerProps as MachineBadgeContainerProps } from '@cocokits/machines/badge-container';
import type { AsTag } from '@cocokits/vue-core';

/**
 * Pins a `Badge` to a corner of the element it wraps, with the `data-position` on its root. It renders a `<div>`
 * with its children in the order written. Each `Badge` must be a direct child of the container.
 *
 * Native attributes fall through to the root.
 *
 * @example
 * <BadgeContainer position="top-right">
 *   <Button>Inbox</Button>
 *   <Badge :content="2" />
 * </BadgeContainer>
 *
 * @cckPart root
 */
export interface BadgeContainerProps extends Pick<MachineBadgeContainerProps, 'position'> {
  /**
   * The tag or component to render. It is ignored with `asChild`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with `as`.
   * @defaultValue 'div'
   */
  readonly as?: AsTag | Component | undefined;
  /**
   * Whether the BadgeContainer merges its class onto the one element or component child of its default slot,
   * instead of rendering an element.
   *
   * @cckSemantic none
   * @cckParity Merges the props onto the single child.
   * @defaultValue false
   */
  readonly asChild?: boolean | undefined;
}
