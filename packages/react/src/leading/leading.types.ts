import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, RefCallback } from 'react';
import type { RenderProp } from '../internal/render-element';

/** The state of the Leading that the function form of `render` receives. The Leading has no state. */
export type LeadingState = Readonly<Record<string, never>>;

/**
 * The props that the function form of `render` receives: the native `div` props merged with the props of the
 * Leading. Pass all of them, `ref` and `children` included, to one element.
 */
export interface LeadingRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'children'> {
  /** The merged ref: the `ref` of the Leading and the `ref` of the rendered element. */
  readonly ref: RefCallback<HTMLElement>;
  /** The children of the Leading, as you wrote them. */
  readonly children: ReactNode;
}

/** Props of the {@link Leading}. Native `div` props pass through, and `ref` reaches the element. */
export interface LeadingProps extends Omit<ComponentPropsWithRef<'div'>, 'color' | 'children'> {
  /**
   * The content of the Leading: an icon, a short text or a button. When not set, the Leading is empty.
   *
   * @example
   * <Leading aria-hidden="true">@</Leading>
   */
  readonly children?: ReactNode;
  /**
   * Replaces the `<div>` of the Leading. Pass an element, or a function of the merged props and the
   * {@link LeadingState}. The function must pass all props on, `ref` and `children` included, to one element.
   *
   * When not set, the Leading renders a `<div>`. The Leading replaces the children of the element with its own.
   *
   * The element form works from a Server Component. The function form does not, because a function cannot be sent
   * from the server.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<LeadingRenderProps, LeadingState> | undefined;
}
