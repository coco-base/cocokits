import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, RefCallback } from 'react';
import type { RenderProp } from '../internal/render-element';

/** The public state of the Leading, passed to the function form of `render`. It has none. */
export type LeadingState = Readonly<Record<string, never>>;

/**
 * The props the function form of `render` receives: the native div props, merged with the
 * Leading's own. Spread all of them, including `ref` and `children`, onto one element.
 */
export interface LeadingRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'children'> {
  /** The merged ref: the Leading's `ref`, and the rendered element's own `ref`. */
  readonly ref: RefCallback<HTMLElement>;
  /** The children, rendered unchanged. */
  readonly children: ReactNode;
}

/** Props of the {@link Leading}. Native `div` attributes pass through to the root, and `ref` reaches it. */
export interface LeadingProps extends Omit<ComponentPropsWithRef<'div'>, 'color' | 'children'> {
  /** The content. */
  readonly children?: ReactNode;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props and the
   * {@link LeadingState}. The element form (its own children are replaced by the children of the Leading) works from a
   * Server Component; the function form does not (a function is not serialisable). The function
   * form must spread all the props it receives, including `ref` and `children`, onto one element.
   *
   * @cckSemantic none
   * @cckParity React's element override (Base UI).
   */
  readonly render?: RenderProp<LeadingRenderProps, LeadingState> | undefined;
}
