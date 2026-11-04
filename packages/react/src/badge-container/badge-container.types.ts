import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, RefCallback } from 'react';
import type {
  BadgeContainerProps as MachineBadgeContainerProps,
  BadgeContainerPosition,
} from '@cocokits/machines/badge-container';
import type { RenderProp } from '../internal/render-element';

/** The public state of the BadgeContainer, passed to the function form of `render`. */
export interface BadgeContainerState {
  /** The corner its badge is pinned to. */
  readonly position: BadgeContainerPosition;
}

/**
 * The props the function form of `render` receives: the native div props, merged with the
 * BadgeContainer's own. Spread all of them, including `ref` and `children`, onto one element.
 */
export interface BadgeContainerRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'children'> {
  /** The merged ref: the BadgeContainer's `ref`, and the rendered element's own `ref`. */
  readonly ref: RefCallback<HTMLElement>;
  /** The children, rendered unchanged. */
  readonly children: ReactNode;
}

/**
 * Props of the {@link BadgeContainer}. Native `div` attributes pass through to the root, and
 * `ref` reaches it.
 */
export interface BadgeContainerProps
  extends Omit<ComponentPropsWithRef<'div'>, 'color'>, Pick<MachineBadgeContainerProps, 'position'> {
  /** The wrapped element and its Badge, rendered as written. */
  children?: ReactNode | undefined;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props and the
   * {@link BadgeContainerState}. The element form (its own children are replaced by the children of the container) works from a Server Component; the function form
   * does not (a function is not serialisable). The function form must spread all the props it
   * receives, including `ref` and `children`, onto one element.
   *
   * @cckSemantic none
   * @remarks React's element override (Base UI).
   */
  readonly render?: RenderProp<BadgeContainerRenderProps, BadgeContainerState> | undefined;
}
