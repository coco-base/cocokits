import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, RefCallback } from 'react';
import type { RenderProp } from '../internal/render-element';

/** The public state of the FieldError, passed to the function form of `render`. */
export interface FieldErrorState {
  /** Whether the content is inserted: forced, outside a field, or the field is invalid and was touched or submitted. */
  readonly shown: boolean;
}

/**
 * The props the function form of `render` receives: the native div props, merged with the
 * FieldError's own. Spread all of them, including `ref` and `children`, onto one element.
 */
export interface FieldErrorRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'children'> {
  /** The merged ref: the FieldError's `ref`, and the rendered element's own `ref`. */
  readonly ref: RefCallback<HTMLElement>;
  /** The message while it is shown; `undefined` otherwise. */
  readonly children: ReactNode;
}

/** Props of the {@link FieldError}. Native `div` attributes pass through to the root, and `ref` reaches it. */
export interface FieldErrorProps extends Omit<ComponentPropsWithRef<'div'>, 'color' | 'children'> {
  /** The message. Keep it cheap: it is created on every render of the owner, and rendered only while shown. */
  readonly children?: ReactNode;
  /**
   * Whether the content shows regardless of the field state.
   *
   * @defaultValue false
   */
  readonly force?: boolean | undefined;
  /**
   * Replaces the rendered `<div>`: an element, or a function of the merged props and the
   * {@link FieldErrorState}. The element form (its own children are replaced by the message) works from a
   * Server Component; the function form does not (a function is not serialisable). The function
   * form must spread all the props it receives, including `ref` and `children`, onto one element.
   *
   * @cckSemantic none
   * @remarks React's element override (Base UI).
   */
  readonly render?: RenderProp<FieldErrorRenderProps, FieldErrorState> | undefined;
}
