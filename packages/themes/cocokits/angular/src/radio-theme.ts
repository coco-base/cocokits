import { Directive, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type RadioOptions = CocokitsThemeConfig['components']['radio'];

/** The `size` values of the cocokits theme. */
export type CckRadioSize = RadioOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type CckRadioColor = RadioOptions['color']['values'][number];
/** The `labelPosition` values of the cocokits theme. */
export type CckRadioLabelPosition = RadioOptions['labelPosition']['values'][number];

/**
 * The cocokits theme options of the Radio. It sits on the same element as the base component
 * (`[cckRadio]`) and provides the values to it; the base renders the `data-*` attributes on the root.
 * Each option resolves in order: the input, then the `provideCckTheme` override, then the config
 * default; `null` removes the attribute. The theme needs `provideCckTheme`; without it no theme
 * attribute renders.
 *
 * @example
 * <div cckRadio size="lg" color="success" labelPosition="before">Label</div>
 * @cckPart root
 */
@Directive({
  selector: '[cckRadio]',
  providers: [
    provideThemeOptions(
      'radio',
      forwardRef(() => CckRadioTheme),
      (theme: CckRadioTheme) => ({ size: theme.size, color: theme.color, labelPosition: theme.labelPosition }),
    ),
  ],
})
export class CckRadioTheme {
  /**
   * Size of the radio and its label text.
   */
  readonly size = input<CckRadioSize | null>();
  /**
   * Color family of the checked state, rendered as `data-cck-color`.
   */
  readonly color = input<CckRadioColor | null>();
  /**
   * Whether the label follows the radio or precedes it, in the writing direction.
   */
  readonly labelPosition = input<CckRadioLabelPosition | null>();
}
