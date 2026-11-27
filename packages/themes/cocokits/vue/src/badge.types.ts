import type { BadgeProps as BaseBadgeProps } from '@cocokits/vue/badge';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type BadgeOptions = CocokitsThemeConfig['components']['badge'];

/** The `variant` values of the cocokits theme. */
export type BadgeVariant = BadgeOptions['variant']['values'][number];
/** The `color` values of the cocokits theme. */
export type BadgeColor = BadgeOptions['color']['values'][number];
/** The `size` values of the cocokits theme. */
export type BadgeSize = BadgeOptions['size']['values'][number];

/**
 * Props of the cocokits Badge. By default it renders a `<span>` with a count, a short text or a dot, and
 * supplies `variant`, `color` and `size` to it. Each option resolves as own option, then
 * `ThemeProvider` override, then config default; `null` removes the attribute. A dot has no text:
 * put the meaning in the host's name.
 *
 * @example
 * <Badge :content="5" variant="rectangle" color="danger" size="lg" />
 * @cckPart root
 */
export interface BadgeProps extends BaseBadgeProps {
  /**
   * Corner radius: a pill or a small radius.
   */
  readonly variant?: BadgeVariant | null | undefined;
  /**
   * Color family, rendered as `data-cck-color`.
   */
  readonly color?: BadgeColor | null | undefined;
  /**
   * Height, padding, dot size and text size.
   */
  readonly size?: BadgeSize | null | undefined;
}
