import { Directive, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type SelectOptions = CocokitsThemeConfig['components']['select'];

/** The `size` values of the cocokits theme. */
export type CckSelectSize = SelectOptions['size']['values'][number];

/**
 * The cocokits theme options of the Select. It sits on the same element as the base component (`[cckSelect]`)
 * and provides the value to it; the base renders the `data-size` attribute on the root, and the theme styles the
 * trigger from it. Each option resolves in order: the input, then the `provideCckTheme` override, then the config
 * default; `null` removes the attribute. Inside a `[cckFormField]` the field sets the size of the trigger. The
 * theme needs `provideCckTheme`; without it no theme attribute renders.
 *
 * @example
 * <div cckSelect size="lg" placeholder="Choose a dish" aria-label="Dish">
 *   <div cckSelectOption value="Cake">Cake</div>
 * </div>
 * @cckPart root
 */
@Directive({
  selector: '[cckSelect]',
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
