import type { IconButtonProps as BaseIconButtonProps } from '@cocokits/vue/icon-button';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type IconButtonOptions = CocokitsThemeConfig['components']['icon-button'];

/** The `variant` values of the cocokits theme. */
export type IconButtonVariant = IconButtonOptions['variant']['values'][number];
/** The `color` values of the cocokits theme. */
export type IconButtonColor = IconButtonOptions['color']['values'][number];
/** The `size` values of the cocokits theme. */
export type IconButtonSize = IconButtonOptions['size']['values'][number];
/** The `rounded` values of the cocokits theme. */
export type IconButtonRounded = IconButtonOptions['rounded']['values'][number];

/**
 * Props of the cocokits IconButton. It renders a native `<button>`, or a link (`<a>`) for `as` other than
 * `'button'` and for `asChild`, and supplies `variant`, `color`, `size` and `rounded` to it. Each option resolves
 * as own option, then `ThemeProvider` override, then config default; `null` removes the attribute. It has no text,
 * so it needs `aria-label` or `aria-labelledby`.
 *
 * @example
 * <IconButton aria-label="Add item" variant="outline" size="lg"><SvgIcon icon-name="plus" /></IconButton>
 * @cckPart root
 */
export interface IconButtonProps extends BaseIconButtonProps {
  /**
   * Fill and border style.
   */
  readonly variant?: IconButtonVariant | null | undefined;
  /**
   * Color family, rendered as `data-cck-color`.
   */
  readonly color?: IconButtonColor | null | undefined;
  /**
   * Side of the square and size of the icon.
   */
  readonly size?: IconButtonSize | null | undefined;
  /**
   * Fully round corners (a circle).
   */
  readonly rounded?: IconButtonRounded | null | undefined;
}
