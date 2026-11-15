import { Directive, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type SwitchOptions = CocokitsThemeConfig['components']['switch'];

/** The `variant` values of the cocokits theme. */
export type CckSwitchVariant = SwitchOptions['variant']['values'][number];
/** The `size` values of the cocokits theme. */
export type CckSwitchSize = SwitchOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type CckSwitchColor = SwitchOptions['color']['values'][number];
/** The `labelPosition` values of the cocokits theme. */
export type CckSwitchLabelPosition = SwitchOptions['labelPosition']['values'][number];

/**
 * The cocokits theme options of the Switch. It sits on the same element as the base component
 * (`cck-switch`) and provides the values to it; the base renders the `data-*` attributes on the root.
 * Each option resolves in order: the input, then the `provideCckTheme` override, then the config
 * default; `null` removes the attribute. The theme needs `provideCckTheme`; without it no theme
 * attribute renders.
 *
 * @example
 * <cck-switch size="lg" color="success" labelPosition="before">Label</cck-switch>
 * @cckPart root
 */
@Directive({
  selector: 'cck-switch',
  providers: [
    provideThemeOptions(
      'switch',
      forwardRef(() => CckSwitchTheme),
      (theme: CckSwitchTheme) => ({
        variant: theme.variant,
        size: theme.size,
        color: theme.color,
        labelPosition: theme.labelPosition,
      }),
    ),
  ],
})
export class CckSwitchTheme {
  /**
   * Look of the track: a contained pill with the thumb inside, or a thin rail with the thumb on it.
   */
  readonly variant = input<CckSwitchVariant | null>();
  /**
   * Size of the track and its label text.
   */
  readonly size = input<CckSwitchSize | null>();
  /**
   * Color family of the checked state, rendered as `data-cck-color`.
   */
  readonly color = input<CckSwitchColor | null>();
  /**
   * Whether the label follows the track or precedes it, in the writing direction.
   */
  readonly labelPosition = input<CckSwitchLabelPosition | null>();
}
