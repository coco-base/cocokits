import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, RefCallback } from 'react';
import type { RenderProp } from '../internal/render-element';

/** The public state of the Trailing, passed to the function form of `render`. It has none. */
export type TrailingState = Readonly<Record<string, never>>;

/**
 * The props the function form of `render` receives: the native div props, merged with the
 * Trailing's own. Spread all of them, including `ref` and `children`, onto one element.
 */
export interface TrailingRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'children'> {
  /** The merged ref: the Trailing's `ref`, and the rendered element's own `ref`. */
  readonly ref: RefCallback<HTMLElement>;
  /** The children, rendered unchanged. */
  readonly children: ReactNode;
}

/** Props of the {@link Trailing}. Native `div` attributes pass through to the root, and `ref` reaches it. */
export interface TrailingProps extends Omit<ComponentPropsWithRef<'div'>, 'color' | 'children'> {
  /** The content. */
  readonly children?: ReactNode;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props and the
   * {@link TrailingState}. The element form (its own children are replaced by the children of the Trailing) works from a
   * Server Component; the function form does not (a function is not serialisable). The function
   * form must spread all the props it receives, including `ref` and `children`, onto one element.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<TrailingRenderProps, TrailingState> | undefined;
}
