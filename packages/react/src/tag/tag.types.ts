import type { ComponentPropsWithRef, HTMLAttributes, ReactNode, RefCallback } from 'react';
import type { RenderProp } from '../internal/render-element';

/** The state of the Tag that the function form of `render` receives. The Tag has no state. */
export type TagState = Readonly<Record<string, never>>;

/**
 * The props that the function form of `render` receives: the native `span` props merged with the props of the Tag.
 * Pass all of them, `ref` and `children` included, to one element.
 */
export interface TagRenderProps extends Omit<HTMLAttributes<HTMLElement>, 'color' | 'children'> {
  /** Any `data-*` attribute, such as the theme options. */
  readonly [attribute: `data-${string}`]: string | undefined;
  /** The merged ref: the `ref` of the Tag and the `ref` of the rendered element. */
  readonly ref: RefCallback<HTMLElement>;
  /** The children of the Tag, as you wrote them. */
  readonly children: ReactNode;
}

/** Props of the {@link Tag}. Native `span` props pass through, and `ref` reaches the element. */
export interface TagProps extends Omit<ComponentPropsWithRef<'span'>, 'color' | 'children'> {
  /**
   * The text of the Tag. An `SvgIcon` can go before or after the text. When not set, the Tag is empty.
   *
   * @example
   * <Tag>Paid</Tag>
   */
  readonly children?: ReactNode;
  /**
   * Replaces the `<span>` of the Tag. Pass an element, or a function of the merged props and the {@link TagState}.
   * The function must pass all props on, `ref` and `children` included, to one element.
   *
   * When not set, the Tag renders a `<span>`. Keep a phrasing element, so that the Tag stays valid inside a line of
   * text. The Tag replaces the children of the element with its own.
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: RenderProp<TagRenderProps, TagState> | undefined;
}
