import { Directive, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type CheckboxOptions = CocokitsThemeConfig['components']['checkbox'];

/** The `size` values of the cocokits theme. */
export type CckCheckboxSize = CheckboxOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type CckCheckboxColor = CheckboxOptions['color']['values'][number];
/** The `labelPosition` values of the cocokits theme. */
export type CckCheckboxLabelPosition = CheckboxOptions['labelPosition']['values'][number];

/**
 * The cocokits theme options of the Checkbox. It sits on the same element as the base component
 * (`[cckCheckbox]`) and provides the values to it; the base renders the `data-*` attributes on the root.
 * Each option resolves in order: the input, then the `provideCckTheme` override, then the config
 * default; `null` removes the attribute. The theme needs `provideCckTheme`; without it no theme
 * attribute renders.
 *
 * @example
 * <div cckCheckbox size="lg" color="success" labelPosition="before">Label</div>
 * @cckPart root
 */
@Directive({
  selector: '[cckCheckbox]',
  providers: [
    provideThemeOptions(
      'checkbox',
      forwardRef(() => CckCheckboxTheme),
      (theme: CckCheckboxTheme) => ({ size: theme.size, color: theme.color, labelPosition: theme.labelPosition }),
    ),
  ],
})
export class CckCheckboxTheme {
  /**
   * Size of the box and its label text.
   */
  readonly size = input<CckCheckboxSize | null>();
  /**
   * Color family of the checked state, rendered as `data-cck-color`.
   */
  readonly color = input<CckCheckboxColor | null>();
  /**
   * Whether the label follows the box or precedes it, in the writing direction.
   */
  readonly labelPosition = input<CckCheckboxLabelPosition | null>();
}
