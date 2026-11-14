import { Directive, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type ChipListOptions = CocokitsThemeConfig['components']['chip-list'];

/** The `size` values of the cocokits theme. */
export type CckChipListSize = ChipListOptions['size']['values'][number];

/**
 * The cocokits theme options of the Chip list. It sits on the same element as the base component
 * (`cck-chip-list`) and provides the value to it; the base renders the `data-size` attribute on the root, and the
 * theme sizes the chips and the text box from it. The option resolves in order: the input, then the
 * `provideCckTheme` override, then the config default; `null` removes the attribute. Inside a `cck-form-field` the
 * field sets the size. The theme needs `provideCckTheme`; without it no theme attribute renders.
 *
 * @example
 * <cck-chip-list size="lg" aria-label="Toppings" [(value)]="toppings" />
 * @cckPart root
 */
@Directive({
  selector: 'cck-chip-list',
  providers: [
    provideThemeOptions(
      'chip-list',
      forwardRef(() => CckChipListTheme),
      (theme: CckChipListTheme) => ({ size: theme.size }),
    ),
  ],
})
export class CckChipListTheme {
  /**
   * Height of its chips and its text box.
   */
  readonly size = input<CckChipListSize | null>();
}
