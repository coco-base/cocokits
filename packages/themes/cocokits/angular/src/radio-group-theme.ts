import { Directive, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type RadioGroupOptions = CocokitsThemeConfig['components']['radio-group'];

/** The `size` values of the cocokits theme. */
export type CckRadioGroupSize = RadioGroupOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type CckRadioGroupColor = RadioGroupOptions['color']['values'][number];
/** The `labelPosition` values of the cocokits theme. */
export type CckRadioGroupLabelPosition = RadioGroupOptions['labelPosition']['values'][number];

/**
 * The cocokits theme options of the Radio group. It sits on the same element as the base component
 * (`cck-radio-group`) and provides the values to it; the base renders the `data-*` attributes on the root. The
 * options exist to be inherited: a `cck-radio` that sets no `size`, `color` or `labelPosition` of its own takes the
 * one of its group. Each option resolves in order: the input, then the `provideCckTheme` override, then the config
 * default (none); `null` removes the attribute. The theme needs `provideCckTheme`; without it no theme attribute
 * renders.
 *
 * @example
 * <cck-radio-group size="lg" color="success" aria-label="Plan">
 *   <cck-radio value="free">Free</cck-radio>
 *   <cck-radio value="pro">Pro</cck-radio>
 * </cck-radio-group>
 * @cckPart root
 */
@Directive({
  selector: 'cck-radio-group',
  providers: [
    provideThemeOptions(
      'radio-group',
      forwardRef(() => CckRadioGroupTheme),
      (theme: CckRadioGroupTheme) => ({ size: theme.size, color: theme.color, labelPosition: theme.labelPosition }),
    ),
  ],
})
export class CckRadioGroupTheme {
  /**
   * Size of the radios that set none of their own.
   */
  readonly size = input<CckRadioGroupSize | null>();
  /**
   * Color family of the radios that set none of their own, rendered as `data-cck-color`.
   */
  readonly color = input<CckRadioGroupColor | null>();
  /**
   * Label side of the radios that set none of their own.
   */
  readonly labelPosition = input<CckRadioGroupLabelPosition | null>();
}
