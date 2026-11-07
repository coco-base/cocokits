import { Directive, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type ButtonOptions = CocokitsThemeConfig['components']['button'];

/** The `variant` values of the cocokits theme. */
export type CckButtonVariant = ButtonOptions['variant']['values'][number];
/** The `color` values of the cocokits theme. */
export type CckButtonColor = ButtonOptions['color']['values'][number];
/** The `size` values of the cocokits theme. */
export type CckButtonSize = ButtonOptions['size']['values'][number];

/**
 * The cocokits theme options of the Button. It sits on the same element as the base
 * directive (`button[cckButton]`, `a[cckButton]`) and provides the values to it; the base
 * renders the `data-*` attributes. Each option resolves in order: the input, then the
 * `provideCckTheme` override, then the config default; `null` removes the attribute. The theme
 * needs `provideCckTheme`; without it no theme attribute renders.
 *
 * @example
 * <button cckButton variant="outline" color="danger" size="lg">Delete</button>
 * @cckPart root
 */
@Directive({
  selector: 'button[cckButton], a[cckButton]',
  providers: [
    provideThemeOptions(
      'button',
      forwardRef(() => CckButtonTheme),
      (theme: CckButtonTheme) => ({ variant: theme.variant, color: theme.color, size: theme.size }),
    ),
  ],
})
export class CckButtonTheme {
  /**
   * Fill and border style.
   */
  readonly variant = input<CckButtonVariant | null>();
  /**
   * Color family, rendered as `data-cck-color`.
   */
  readonly color = input<CckButtonColor | null>();
  /**
   * Minimum height, padding and text size.
   */
  readonly size = input<CckButtonSize | null>();
}
