import { Directive, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type BadgeOptions = CocokitsThemeConfig['components']['badge'];

/** The `variant` values of the cocokits theme. */
export type CckBadgeVariant = BadgeOptions['variant']['values'][number];
/** The `color` values of the cocokits theme. */
export type CckBadgeColor = BadgeOptions['color']['values'][number];
/** The `size` values of the cocokits theme. */
export type CckBadgeSize = BadgeOptions['size']['values'][number];

/**
 * The cocokits theme options of the Badge. It sits on the same element as the base component
 * (`cck-badge`) and provides the values to it; the base renders the `data-*` attributes. Each
 * option resolves in order: the input, then the `provideCckTheme` override, then the config
 * default; `null` removes the attribute. The theme needs `provideCckTheme`; without it no theme
 * attribute renders.
 *
 * @example
 * <cck-badge [content]="5" variant="rectangle" color="danger" size="lg"></cck-badge>
 * @cckPart root
 */
@Directive({
  selector: 'cck-badge',
  providers: [
    provideThemeOptions(
      'badge',
      forwardRef(() => CckBadgeTheme),
      (theme: CckBadgeTheme) => ({ variant: theme.variant, color: theme.color, size: theme.size }),
    ),
  ],
})
export class CckBadgeTheme {
  /**
   * Corner radius: a pill or a small radius.
   */
  readonly variant = input<CckBadgeVariant | null>();
  /**
   * Color family, rendered as `data-cck-color`.
   */
  readonly color = input<CckBadgeColor | null>();
  /**
   * Height, padding, dot size and text size.
   */
  readonly size = input<CckBadgeSize | null>();
}
