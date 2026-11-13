import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, RefCallback } from 'react';
import type { RenderProp } from '../internal/render-element';

/** The state of the AvatarLabel that the function form of `render` receives. */
export interface AvatarLabelState {
  /** Whether a name is shown. */
  readonly hasName: boolean;
  /** Whether a description is shown. */
  readonly hasDescription: boolean;
}

/**
 * The props that the function form of `render` receives. They are the native `div` props merged with those of the
 * AvatarLabel. The avatar and the text come as `children`.
 *
 * @remarks Pass all of them, `ref` included, to one element.
 */
export interface AvatarLabelRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'children'> {
  /** The merged ref: the `ref` of the AvatarLabel and the `ref` of the rendered element. */
  readonly ref: RefCallback<HTMLElement>;
  /** The avatar you wrote, then the text with the name and the description. */
  readonly children: ReactNode;
}

/**
 * Props of the {@link AvatarLabel}. Native `div` props pass through, and `ref` reaches the element.
 */
export interface AvatarLabelProps extends Omit<ComponentPropsWithRef<'div'>, 'color'> {
  /**
   * The avatar, as you write it. It must be a direct child and come first: the label puts the text after it.
   * When not set, the label shows only the text.
   *
   * @example
   * <AvatarLabel name="Ada Park" description="Engineer">
   *   <Avatar.Root aria-hidden="true">
   *     <Avatar.Fallback>AP</Avatar.Fallback>
   *   </Avatar.Root>
   * </AvatarLabel>
   */
  children?: ReactNode | undefined;
  /**
   * The name of the person. When not set or empty, no name is rendered.
   *
   * @cckSemantic avatar-label.name
   */
  readonly name?: string | undefined;
  /**
   * A second line, such as a role or an email. When not set or empty, no description is rendered.
   *
   * @cckSemantic avatar-label.description
   */
  readonly description?: string | undefined;
  /**
   * Replaces the `<div>` of the label. Pass an element, or a function of the merged props and the
   * {@link AvatarLabelState}. The function must pass all props on, `ref` and `children` included, to one element.
   *
   * When not set, the label renders a `<div>`. The label replaces the children of the element with its own.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   * @cckShared
   */
  readonly render?: RenderProp<AvatarLabelRenderProps, AvatarLabelState> | undefined;
}
