import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, RefCallback } from 'react';
import type {
  BadgeContainerProps as MachineBadgeContainerProps,
  BadgeContainerPosition,
} from '@cocokits/machines/badge-container';
import type { RenderProp } from '../internal/render-element';

/** The state of the BadgeContainer that the function form of `render` receives. */
export interface BadgeContainerState {
  /** The corner that the Badge sits on. */
  readonly position: BadgeContainerPosition;
}

/**
 * The props that the function form of `render` receives: the native `div` props merged with the props of the
 * BadgeContainer. Pass all of them, `ref` and `children` included, to one element.
 */
export interface BadgeContainerRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'children'> {
  /** The merged ref: the `ref` of the BadgeContainer and the `ref` of the rendered element. */
  readonly ref: RefCallback<HTMLElement>;
  /** The children of the BadgeContainer, as you wrote them. */
  readonly children: ReactNode;
}

/** Props of the {@link BadgeContainer}. Native `div` props pass through, and `ref` reaches the element. */
export interface BadgeContainerProps
  extends Omit<ComponentPropsWithRef<'div'>, 'color'>, Pick<MachineBadgeContainerProps, 'position'> {
  /**
   * The element to mark and its Badge, in the order you write them. The Badge must be a direct child. When not
   * set, the container is empty.
   *
   * @example
   * <BadgeContainer position="top-right">
   *   <button type="button">Inbox</button>
   *   <Badge content={2} />
   * </BadgeContainer>
   */
  children?: ReactNode | undefined;
  /**
   * Replaces the `<div>` of the container. Pass an element, or a function of the merged props and the
   * {@link BadgeContainerState}. The function must pass all props on, `ref` and `children` included, to one element.
   *
   * When not set, the container renders a `<div>`. The container replaces the children of the element with its own.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<BadgeContainerRenderProps, BadgeContainerState> | undefined;
}
