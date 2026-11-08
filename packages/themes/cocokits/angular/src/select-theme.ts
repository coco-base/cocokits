import { Directive, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type SelectOptions = CocokitsThemeConfig['components']['select'];

/** The `size` values of the cocokits theme. */
export type CckSelectSize = SelectOptions['size']['values'][number];

/**
 * The cocokits theme options of the Select. It sits on the same element as the base component (`cck-select`)
 * and provides the value to it; the base renders the `data-size` attribute on the root, and the theme styles the
 * trigger from it. Each option resolves in order: the input, then the `provideCckTheme` override, then the config
 * default; `null` removes the attribute. Inside a `cck-form-field` the field sets the size of the trigger. The
 * theme needs `provideCckTheme`; without it no theme attribute renders.
 *
 * @example
 * <cck-select size="lg" placeholder="Choose a dish" aria-label="Dish">
 *   <cck-select-option value="Cake">Cake</cck-select-option>
 * </cck-select>
 * @cckPart root
 */
@Directive({
  selector: 'cck-select',
  providers: [
    provideThemeOptions(
      'select',
      forwardRef(() => CckSelectTheme),
      (theme: CckSelectTheme) => ({ size: theme.size }),
    ),
  ],
})
export class CckSelectTheme {
  /**
   * Height, padding and text of the trigger.
   */
  readonly size = input<CckSelectSize | null>();
}
