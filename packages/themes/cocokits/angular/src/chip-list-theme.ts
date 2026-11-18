import { Directive, computed, forwardRef, inject, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import { resolveInheritedValue, type CocokitsThemeConfig } from '@cocokits/theme-cocokits';
import { CckFormFieldTheme } from './form-field-theme';

type ChipListOptions = CocokitsThemeConfig['components']['chip-list'];

/** The `size` values of the cocokits theme. */
export type CckChipListSize = ChipListOptions['size']['values'][number];

/**
 * The cocokits theme options of the Chip list. It sits on the same element as the base component
 * (`cck-chip-list`) and provides the value to it; the base renders the `data-size` attribute on the root, and the
 * theme sizes the row and the text box from it. The chips the list renders keep the size of a chip. The option
 * resolves in order: the input, then the `size` of the `cck-form-field` around it, then the `provideCckTheme`
 * override, then the config default; `null` removes the attribute. The theme needs `provideCckTheme`; without it no
 * theme attribute renders.
 *
 * @example
 * <cck-chip-list size="lg" aria-label="Toppings" [(value)]="toppings" />
 * @cckPart root
 */
@Directive({
  selector: 'cck-chip-list',
  host: {
    '[attr.size]': 'null',
  },
  providers: [
    provideThemeOptions(
      'chip-list',
      forwardRef(() => CckChipListTheme),
      (theme: CckChipListTheme) => ({ size: theme._size }),
    ),
  ],
})
export class CckChipListTheme {
  /**
   * Height of its text box and its row.
   */
  readonly size = input<CckChipListSize | null>();
  private readonly field = inject(CckFormFieldTheme, { optional: true });
  /** The size of the list: its own, else the one of its field. The chips of a future composition read it. @internal */
  readonly _size = computed(() => resolveInheritedValue(this.size(), this.field?.size()));
}
