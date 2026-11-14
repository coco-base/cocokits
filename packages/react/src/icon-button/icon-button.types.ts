import type { ReactElement, ReactNode } from 'react';
import type { ButtonProps, ButtonRenderProps, ButtonState } from '../button';

/** The state of the IconButton that the function form of `render` receives. */
export type IconButtonState = ButtonState;

/** The props that the function form of `render` receives. Same as {@link ButtonRenderProps}. */
export type IconButtonRenderProps = ButtonRenderProps;

/** Props of the {@link IconButton}. The Button props: native button props pass through. */
export interface IconButtonProps extends ButtonProps {
  /**
   * The icon of the button: a `SvgIcon`, or your own decorative `<svg aria-hidden="true">`. No text. When not set,
   * the button is empty.
   *
   * The button has no name of its own, so give it an `aria-label` or an `aria-labelledby`; in development a missing name logs a
   * `CocoKits:` error.
   *
   * @example
   * <IconButton aria-label="Add item">
   *   <SvgIcon iconName="plus" />
   * </IconButton>
   * @cckSemantic icon-button.default
   */
  children?: ReactNode | undefined;
  /**
   * Replaces the `<button>` of the IconButton. Pass an element, or a function of the merged props and the
   * {@link IconButtonState}. The function must pass all props on, `ref` included, to one element.
   *
   * When not set, the IconButton renders a `<button>`. A link also needs `nativeButton={false}`.
   *
   * The element form works from a Server Component. The function form does not, because a function cannot be sent
   * from the server.
   *
   * @example
   * <IconButton nativeButton={false} render={<a href="/settings" />} aria-label="Settings">
   *   <SvgIcon iconName="setting" />
   * </IconButton>
   *
   * @cckSemantic none
   * @cckParity Replaces the rendered element with the `render` prop.
   */
  readonly render?: ReactElement | ((props: IconButtonRenderProps, state: IconButtonState) => ReactElement) | undefined;
  /**
   * Whether the rendered element is a native `<button>`. Set it to `false` when `render` gives a link. A link is the
   * only other element the IconButton takes: an `<a>`, or a link component that renders one.
   *
   * A link gets no `role`, no `tabindex` and no Space key handling.
   *
   * @cckSemantic none
   * @cckParity A flag; `false` renders link semantics (CocoKits supports a link as the only non-button element).
   * @defaultValue true
   */
  readonly nativeButton?: boolean | undefined;
}
