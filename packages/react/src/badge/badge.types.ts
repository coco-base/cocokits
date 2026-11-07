import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, RefCallback } from 'react';
import type { BadgeProps as MachineBadgeProps } from '@cocokits/machines/badge';
import type { RenderProp } from '../internal/render-element';

/** The public state of the Badge, passed to the function form of `render`. */
export interface BadgeState {
  /** Whether no text is shown. */
  readonly empty: boolean;
  /** Whether the content is above `max`. */
  readonly truncated: boolean;
  /** Whether the Badge is hidden. */
  readonly hidden: boolean;
}

/**
 * The props the function form of `render` receives: the native span props, merged with the
 * Badge's own, with the content parts as `children`. Spread all of them, including `ref`, onto one element.
 */
export interface BadgeRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'children'> {
  /** Any `data-*` attribute, such as `data-empty` and the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The merged ref: the Badge's `ref`, and the rendered element's own `ref`. */
  readonly ref: RefCallback<HTMLElement>;
  /** The content and max indicator parts. */
  readonly children: ReactNode;
}

/**
 * Props of the {@link Badge}. Native `span` attributes pass through to the root, and `ref`
 * reaches it. The badge draws its own content, so it takes no `children`.
 */
export interface BadgeProps
  extends
    Omit<ComponentPropsWithRef<'span'>, 'color' | 'children' | 'content'>,
    Pick<MachineBadgeProps, 'content' | 'max' | 'hide'> {
  /**
   * Replaces the rendered `<span>`: an element, or a function of the merged props and the
   * {@link BadgeState}. The element form (its own children are replaced by the parts) works from a Server Component; the function form
   * does not (a function is not serialisable). The function form must spread all the props it
   * receives, including `ref`, onto one element. Keep a phrasing element, so the Badge stays valid inside a `<button>`.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<BadgeRenderProps, BadgeState> | undefined;
}
