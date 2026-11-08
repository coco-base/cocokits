import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, RefCallback } from 'react';
import type { RenderProp } from '../internal/render-element';

/** The state of the FieldError that the function form of `render` receives. */
export interface FieldErrorState {
  /**
   * Whether the message shows. It shows with `force`, outside a field, or while the field is not valid and the user
   * has left it or tried to submit.
   */
  readonly shown: boolean;
}

/**
 * The props that the function form of `render` receives: the native `div` props merged with the props of the
 * FieldError. Pass all of them, `ref` and `children` included, to one element.
 */
export interface FieldErrorRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'children'> {
  /** The merged ref: the `ref` of the FieldError and the `ref` of the rendered element. */
  readonly ref: RefCallback<HTMLElement>;
  /** The message while it shows, and `undefined` while it is hidden. */
  readonly children: ReactNode;
}

/** Props of the {@link FieldError}. Native `div` props pass through, and `ref` reaches the element. */
export interface FieldErrorProps extends Omit<ComponentPropsWithRef<'div'>, 'color' | 'children'> {
  /**
   * The error message. When not set, the error shows no text.
   *
   * Keep it cheap to create, because it is created on every render of its owner and rendered only while it shows.
   *
   * @example
   * <FieldError>Enter an email address.</FieldError>
   */
  readonly children?: ReactNode;
  /**
   * Whether the message shows, whatever the state of the field.
   *
   * @defaultValue false
   */
  readonly force?: boolean | undefined;
  /**
   * Replaces the `<div>` of the FieldError. Pass an element, or a function of the merged props and the
   * {@link FieldErrorState}. The function must pass all props on, `ref` and `children` included, to one element.
   *
   * When not set, the FieldError renders a `<div>`. The FieldError replaces the children of the element with the
   * message.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<FieldErrorRenderProps, FieldErrorState> | undefined;
}
