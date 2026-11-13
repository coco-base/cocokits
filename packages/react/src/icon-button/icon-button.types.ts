import type { ReactNode } from 'react';
import type { ButtonProps, ButtonRenderProps, ButtonState } from '../button';

/** The state of the IconButton that the function form of `render` receives. */
export type IconButtonState = ButtonState;

/** The props that the function form of `render` receives. Same as {@link ButtonRenderProps}. */
export type IconButtonRenderProps = ButtonRenderProps;

/** Props of the {@link IconButton}. The Button props: native button props pass through. */
export interface IconButtonProps extends ButtonProps {
  /**
   * The icon of the button: a `SvgIcon`, or your own decorative `<svg aria-hidden="true">`. No text. The button has
   * no name of its own, so give it an `aria-label` or an `aria-labelledby`; in development a missing name logs a
   * `CocoKits:` error.
   *
   * @example
   * <IconButton aria-label="Add item">
   *   <SvgIcon iconName="plus" />
   * </IconButton>
   * @cckSemantic icon-button.default
   */
  children?: ReactNode | undefined;
}
