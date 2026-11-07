import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, RefCallback } from 'react';
import type { RenderProp } from '../internal/render-element';

/** The state of the Trailing that the function form of `render` receives. The Trailing has no state. */
export type TrailingState = Readonly<Record<string, never>>;

/**
 * The props that the function form of `render` receives: the native `div` props merged with the props of the
 * Trailing. Pass all of them, `ref` and `children` included, to one element.
 */
export interface TrailingRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'children'> {
  /** The merged ref: the `ref` of the Trailing and the `ref` of the rendered element. */
  readonly ref: RefCallback<HTMLElement>;
  /** The children of the Trailing, as you wrote them. */
  readonly children: ReactNode;
}

/** Props of the {@link Trailing}. Native `div` props pass through, and `ref` reaches the element. */
export interface TrailingProps extends Omit<ComponentPropsWithRef<'div'>, 'color' | 'children'> {
  /**
   * The content of the Trailing: an icon, a short text or a button. When not set, the Trailing is empty.
   *
   * @example
   * <Trailing>6 digits</Trailing>
   */
  readonly children?: ReactNode;
  /**
   * Replaces the `<div>` of the Trailing. Pass an element, or a function of the merged props and the
   * {@link TrailingState}. The function must pass all props on, `ref` and `children` included, to one element.
   *
   * When not set, the Trailing renders a `<div>`. The Trailing replaces the children of the element with its own.
   *
   * The element form works from a Server Component. The function form does not, because a function cannot be sent
   * from the server.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<TrailingRenderProps, TrailingState> | undefined;
}
