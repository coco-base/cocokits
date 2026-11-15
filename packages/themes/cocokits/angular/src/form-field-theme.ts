import { Directive, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type FormFieldOptions = CocokitsThemeConfig['components']['form-field'];

/** The `size` values of the cocokits theme. */
export type CckFormFieldSize = FormFieldOptions['size']['values'][number];
/** The `width` values of the cocokits theme. */
export type CckFormFieldWidth = FormFieldOptions['width']['values'][number];

/**
 * The cocokits theme options of the FormField. It sits on the same element as the base component
 * (`cck-form-field`) and provides the values to it; the base renders the `data-size` attribute on the
 * root and on the input wrapper and `data-width` on the root. Each option resolves in order: the input, then the
 * `provideCckTheme` override, then the config default; `null` removes the attribute. The theme needs `provideCckTheme`;
 * without it no theme attribute renders.
 *
 * @example
 * <cck-form-field size="lg"><input cckInput /></cck-form-field>
 * @cckPart root
 */
@Directive({
  selector: 'cck-form-field',
  providers: [
    provideThemeOptions(
      'form-field',
      forwardRef(() => CckFormFieldTheme),
      (theme: CckFormFieldTheme) => ({ size: theme.size, width: theme.width }),
    ),
  ],
})
export class CckFormFieldTheme {
  /**
   * Height, padding and text size of the input box.
   */
  readonly size = input<CckFormFieldSize | null>();
  /**
   * Width of the field. Without it the field keeps the width its layout gives it.
   */
  readonly width = input<CckFormFieldWidth | null>();
}
