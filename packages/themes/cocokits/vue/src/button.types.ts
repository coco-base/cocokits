import type { ButtonProps as BaseButtonProps } from '@cocokits/vue/button';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type ButtonOptions = CocokitsThemeConfig['components']['button'];

/** The `variant` values of the cocokits theme. */
export type ButtonVariant = ButtonOptions['variant']['values'][number];
/** The `color` values of the cocokits theme. */
export type ButtonColor = ButtonOptions['color']['values'][number];
/** The `size` values of the cocokits theme. */
export type ButtonSize = ButtonOptions['size']['values'][number];

/**
 * Props of the cocokits Button. It renders a native `<button>`, or a link (`<a>`) for `as` other
 * than `'button'` and for `asChild`, and supplies `variant`, `color` and `size` to it. Each option
 * resolves as own option, then `ThemeProvider` override, then config default; `null` removes the
 * attribute. An icon-only Button needs `aria-label` or `aria-labelledby`.
 *
 * @example
 * <Button variant="outline" color="danger" size="lg">Delete</Button>
 * @cckPart root
 */
export interface ButtonProps extends BaseButtonProps {
  /**
   * Fill and border style.
   */
  readonly variant?: ButtonVariant | null | undefined;
  /**
   * Color family, rendered as `data-cck-color`.
   */
  readonly color?: ButtonColor | null | undefined;
  /**
   * Minimum height, padding and text size.
   */
  readonly size?: ButtonSize | null | undefined;
}
