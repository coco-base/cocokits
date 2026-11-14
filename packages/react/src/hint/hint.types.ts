import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, RefCallback } from 'react';
import type { RenderProp } from '../internal/render-element';

/** The state of the Hint that the function form of `render` receives. The Hint has no state. */
export type HintState = Readonly<Record<string, never>>;

/**
 * The props that the function form of `render` receives: the native `div` props merged with the props of the Hint.
 * Pass all of them, `ref` and `children` included, to one element.
 */
export interface HintRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'children'> {
  /** The merged ref: the `ref` of the Hint and the `ref` of the rendered element. */
  readonly ref: RefCallback<HTMLElement>;
  /** The children of the Hint, as you wrote them. */
  readonly children: ReactNode;
}

/** Props of the {@link Hint}. Native `div` props pass through, and `ref` reaches the element. */
export interface HintProps extends Omit<ComponentPropsWithRef<'div'>, 'color' | 'children'> {
  /**
   * The help text, with an icon if you want one. When not set, the Hint shows no text.
   *
   * @example
   * <Hint>We only use it for the receipt.</Hint>
   */
  readonly children?: ReactNode;
  /**
   * Replaces the `<div>` of the Hint. Pass an element, or a function of the merged props and the {@link HintState}.
   * The function must pass all props on, `ref` and `children` included, to one element.
   *
   * When not set, the Hint renders a `<div>`. The Hint replaces the children of the element with its own.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<HintRenderProps, HintState> | undefined;
}
