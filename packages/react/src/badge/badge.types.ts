import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, RefCallback } from 'react';
import type { BadgeProps as MachineBadgeProps } from '@cocokits/machines/badge';
import type { RenderProp } from '../internal/render-element';

/** The state of the Badge that the function form of `render` receives. */
export interface BadgeState {
  /** Whether no text is shown. */
  readonly empty: boolean;
  /** Whether the content is above `max`. */
  readonly truncated: boolean;
  /** Whether the Badge is hidden. */
  readonly hidden: boolean;
}

/**
 * The props that the function form of `render` receives: the native `span` props merged with the props of the
 * Badge, and the content as `children`. Pass all of them, `ref` included, to one element.
 */
export interface BadgeRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'children'> {
  /** Any `data-*` attribute, such as `data-empty` and the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The merged ref: the `ref` of the Badge and the `ref` of the rendered element. */
  readonly ref: RefCallback<HTMLElement>;
  /** The content of the Badge, with the `+` of a count above `max`. */
  readonly children: ReactNode;
}

/**
 * Props of the {@link Badge}. Native `span` props pass through, and `ref` reaches the element. The Badge draws its
 * own content, so it takes no `children`.
 */
export interface BadgeProps
  extends
    Omit<ComponentPropsWithRef<'span'>, 'color' | 'children' | 'content'>,
    Pick<MachineBadgeProps, 'content' | 'max' | 'hide'> {
  /**
   * Replaces the `<span>` of the Badge. Pass an element, or a function of the merged props and the
   * {@link BadgeState}. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the Badge renders a `<span>`. Keep a phrasing element, so that the Badge stays valid inside a
   * `<button>`. The Badge replaces the children of the element with its content.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<BadgeRenderProps, BadgeState> | undefined;
}
