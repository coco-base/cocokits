import { Directive, computed, forwardRef, inject, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import { resolveInheritedValue, type CocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { CckFormFieldTheme } from './form-field-theme';

type SelectOptions = CocokitsThemeConfig['components']['select'];

/** The `size` values of the cocokits theme. */
export type CckSelectSize = SelectOptions['size']['values'][number];
/** The `indicator` values of the cocokits theme. */
export type CckSelectIndicator = SelectOptions['indicator']['values'][number];

/**
 * The cocokits theme options of the Select. It sits on the same element as the base component (`cck-select`)
 * and provides the values to it; the base renders `data-size` on the root, and the theme styles the trigger from it,
 * and `data-indicator` on the list. Each option resolves in order: the input, then (for `size`) the `size` of the
 * `cck-form-field` around it, then the `provideCckTheme` override, then the config default; `null` removes the
 * attribute. The theme needs `provideCckTheme`; without it no theme attribute renders.
 *
 * @example
 * <cck-select size="lg" placeholder="Choose a dish" aria-label="Dish">
 *   <cck-select-option value="Cake">Cake</cck-select-option>
 * </cck-select>
 * @cckPart root
 */
@Directive({
  selector: 'cck-select',
  host: {
    '[attr.size]': 'null',
    '[attr.indicator]': 'null',
  },
  providers: [
    provideThemeOptions(
      'select',
      forwardRef(() => CckSelectTheme),
      (theme: CckSelectTheme) => ({ size: theme._size, indicator: theme.indicator }),
    ),
  ],
})
export class CckSelectTheme {
  /**
   * Height, padding and text of the trigger.
   */
  readonly size = input<CckSelectSize | null>();
  /**
   * Mark of the selected option, rendered on the list: a check after the text, a box before it, or none. Without it a
   * single list shows a check and a multiple list a box.
   */
  readonly indicator = input<CckSelectIndicator | null>();
  private readonly field = inject(CckFormFieldTheme, { optional: true });
  /** The size of the trigger: its own, else the one of its field. @internal */
  readonly _size = computed(() => resolveInheritedValue(this.size(), this.field?.size()));
}
