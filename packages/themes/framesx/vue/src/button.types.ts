import type { ButtonProps as BaseButtonProps } from '@cocokits/vue/button';
import type { FramesxThemeConfig } from '@cocokits/theme-framesx';

type ButtonOptions = FramesxThemeConfig['components']['button'];

/** The `variant` values of the FramesX theme. */
export type ButtonVariant = ButtonOptions['variant']['values'][number];

/**
 * Props of the FramesX Button. It renders a native `<button>`, or a link (`<a>`) for `as` other
 * than `'button'` and for `asChild`, and supplies `variant` to it. The option resolves as own
 * option, then `ThemeProvider` override, then config default; `null` removes the attribute. The
 * theme needs a `ThemeProvider`. An icon-only Button needs `aria-label` or `aria-labelledby`.
 *
 * @example
 * <Button variant="outline">Delete</Button>
 * @cckPart root
 */
export interface ButtonProps extends BaseButtonProps {
  /**
   * Fill and border style.
   */
  readonly variant?: ButtonVariant | null | undefined;
}
