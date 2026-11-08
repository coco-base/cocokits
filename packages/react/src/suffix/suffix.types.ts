import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, RefCallback } from 'react';
import type { RenderProp } from '../internal/render-element';

/** The state of the Suffix that the function form of `render` receives. The Suffix has no state. */
export type SuffixState = Readonly<Record<string, never>>;

/**
 * The props that the function form of `render` receives: the native `div` props merged with the props of the
 * Suffix. Pass all of them, `ref` and `children` included, to one element.
 */
export interface SuffixRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'children'> {
  /** The merged ref: the `ref` of the Suffix and the `ref` of the rendered element. */
  readonly ref: RefCallback<HTMLElement>;
  /** The children of the Suffix, as you wrote them. */
  readonly children: ReactNode;
}

/** Props of the {@link Suffix}. Native `div` props pass through, and `ref` reaches the element. */
export interface SuffixProps extends Omit<ComponentPropsWithRef<'div'>, 'color' | 'children'> {
  /**
   * The content of the Suffix: an icon, a short text or a button. When not set, the Suffix is empty.
   *
   * @example
   * <Suffix>kg</Suffix>
   */
  readonly children?: ReactNode;
  /**
   * Replaces the `<div>` of the Suffix. Pass an element, or a function of the merged props and the
   * {@link SuffixState}. The function must pass all props on, `ref` and `children` included, to one element.
   *
   * When not set, the Suffix renders a `<div>`. The Suffix replaces the children of the element with its own.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<SuffixRenderProps, SuffixState> | undefined;
}
