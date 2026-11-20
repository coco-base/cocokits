import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, RefCallback } from 'react';
import type { RenderProp } from '../internal/render-element';

/** The state of the Prefix that the function form of `render` receives. The Prefix has no state. */
export type PrefixState = Readonly<Record<string, never>>;

/**
 * The props that the function form of `render` receives: the native `div` props merged with the props of the
 * Prefix. Pass all of them, `ref` and `children` included, to one element.
 */
export interface PrefixRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'children'> {
  /** The merged ref: the `ref` of the Prefix and the `ref` of the rendered element. */
  readonly ref: RefCallback<HTMLElement>;
  /** The children of the Prefix, as you wrote them. */
  readonly children: ReactNode;
}

/** Props of the {@link Prefix}. Native `div` props pass through, and `ref` reaches the element. */
export interface PrefixProps extends Omit<ComponentPropsWithRef<'div'>, 'color' | 'children'> {
  /**
   * The content of the Prefix: an icon, a short text or a button. When not set, the Prefix is empty.
   *
   * @example
   * <Prefix>$</Prefix>
   */
  readonly children?: ReactNode;
  /**
   * Replaces the `<div>` of the Prefix. Pass an element, or a function of the merged props and the
   * {@link PrefixState}. The function must pass all props on, `ref` and `children` included, to one element.
   *
   * When not set, the Prefix renders a `<div>`. The Prefix replaces the children of the element with its own.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<PrefixRenderProps, PrefixState> | undefined;
}
