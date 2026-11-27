import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, RefCallback } from 'react';
import type { RenderProp } from '../internal/render-element';

/** The state of the AvatarGroup that the function form of `render` receives. It has none. */
export type AvatarGroupState = Readonly<Record<string, never>>;

/**
 * The props that the function form of `render` receives: the native `div` props merged with the props of the
 * AvatarGroup. Pass all of them, `ref` and `children` included, to one element.
 */
export interface AvatarGroupRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'children'> {
  /** The merged ref: the `ref` of the AvatarGroup and the `ref` of the rendered element. */
  readonly ref: RefCallback<HTMLElement>;
  /** The children of the AvatarGroup, as you wrote them. */
  readonly children: ReactNode;
}

/** Props of the {@link AvatarGroup}. Native `div` props pass through, and `ref` reaches the element. */
export interface AvatarGroupProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /**
   * The avatars, in the order you write them. Each must be a direct child, because the theme sets the overlap and
   * the size of `.cck-avatar-group > .cck-avatar`. When not set, the group is empty.
   *
   * @example
   * <AvatarGroup role="group" aria-label="Team">
   *   <Avatar.Root><Avatar.Fallback>AP</Avatar.Fallback></Avatar.Root>
   *   <Avatar.Root><Avatar.Fallback>BK</Avatar.Fallback></Avatar.Root>
   * </AvatarGroup>
   */
  children?: ReactNode | undefined;
  /**
   * Replaces the `<div>` of the group. Pass an element, or a function of the merged props and the
   * {@link AvatarGroupState}. The function must pass all props on, `ref` and `children` included, to one element.
   *
   * When not set, the group renders a `<div>`. The group replaces the children of the element with its own.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<AvatarGroupRenderProps, AvatarGroupState> | undefined;
}
