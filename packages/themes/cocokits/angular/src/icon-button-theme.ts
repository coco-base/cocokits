import { Directive, booleanAttribute, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type IconButtonOptions = CocokitsThemeConfig['components']['icon-button'];

/** The `variant` values of the cocokits theme. */
export type CckIconButtonVariant = IconButtonOptions['variant']['values'][number];
/** The `color` values of the cocokits theme. */
export type CckIconButtonColor = IconButtonOptions['color']['values'][number];
/** The `size` values of the cocokits theme. */
export type CckIconButtonSize = IconButtonOptions['size']['values'][number];
/** The `rounded` values of the cocokits theme. */
export type CckIconButtonRounded = IconButtonOptions['rounded']['values'][number];

/** Reads the attribute form: `rounded` alone and `rounded=""` mean true; `null` and `undefined` pass through. */
const toRounded = (value: CckIconButtonRounded | string | null | undefined): CckIconButtonRounded | null | undefined =>
  value == null ? value : booleanAttribute(value);

/**
 * The cocokits theme options of the Icon button. It sits on the same element as the base
 * directive (`button[cckIconButton]`, `a[cckIconButton]`) and provides the values to it; the base
 * renders the `data-*` attributes. Each option resolves in order: the input, then the
 * `provideCckTheme` override, then the config default; `null` removes the attribute. The theme
 * needs `provideCckTheme`; without it no theme attribute renders.
 *
 * @example
 * <button cckIconButton variant="outline" color="danger" size="lg" rounded aria-label="Delete">
 *   <cck-svg-icon iconName="trash" />
 * </button>
 * @cckPart root
 */
@Directive({
  selector: 'button[cckIconButton], a[cckIconButton]',
  providers: [
    provideThemeOptions(
      'icon-button',
      forwardRef(() => CckIconButtonTheme),
      (theme: CckIconButtonTheme) => ({
        variant: theme.variant,
        color: theme.color,
        size: theme.size,
        rounded: theme.rounded,
      }),
    ),
  ],
})
export class CckIconButtonTheme {
  /**
   * Fill and border style.
   */
  readonly variant = input<CckIconButtonVariant | null>();
  /**
   * Color family, rendered as `data-cck-color`.
   */
  readonly color = input<CckIconButtonColor | null>();
  /**
   * Side of the square and size of the icon.
   */
  readonly size = input<CckIconButtonSize | null>();
  /**
   * Fully round corners, a circle.
   */
  readonly rounded = input<CckIconButtonRounded | null | undefined, CckIconButtonRounded | string | null | undefined>(
    undefined,
    { transform: toRounded },
  );
}
