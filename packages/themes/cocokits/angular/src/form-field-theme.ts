import { Directive, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type FormFieldOptions = CocokitsThemeConfig['components']['form-field'];

/** The `size` values of the cocokits theme. */
export type CckFormFieldSize = FormFieldOptions['size']['values'][number];

/**
 * The cocokits theme options of the FormField. It sits on the same element as the base component
 * (`[cckFormField]`) and provides the value to it; the base renders the `data-size` attribute on the
 * root and on the input wrapper. The option resolves in order: the input, then the `provideCckTheme`
 * override, then the config default; `null` removes the attribute. The theme needs `provideCckTheme`;
 * without it no theme attribute renders.
 *
 * @example
 * <div cckFormField size="lg"><input cckInput /></div>
 * @cckPart root
 */
@Directive({
  selector: '[cckFormField]',
  providers: [
    provideThemeOptions(
      'form-field',
      forwardRef(() => CckFormFieldTheme),
      (theme: CckFormFieldTheme) => ({ size: theme.size }),
    ),
  ],
})
export class CckFormFieldTheme {
  /**
   * Height, padding and text size of the input box.
   */
  readonly size = input<CckFormFieldSize | null>();
}
