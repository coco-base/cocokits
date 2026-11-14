import { Directive, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type ChipOptions = CocokitsThemeConfig['components']['chip'];

/** The `size` values of the cocokits theme. */
export type CckChipSize = ChipOptions['size']['values'][number];

/**
 * The cocokits theme options of the Chip. It sits on the same element as the base component (`cck-chip`) and
 * provides the value to it; the base renders the `data-size` attribute on the root. The option resolves in order:
 * the input, then the `provideCckTheme` override, then the config default; `null` removes the attribute. Inside a
 * `cck-chip-list` the list sets the height of its chips. The remove button draws the icon the theme names in
 * `components.chip.icons.remove`. The theme needs `provideCckTheme`; without it no theme attribute renders.
 *
 * @example
 * <cck-chip size="lg" removable (removed)="remove('Pizza')">Pizza</cck-chip>
 * @cckPart root
 */
@Directive({
  selector: 'cck-chip',
  providers: [
    provideThemeOptions(
      'chip',
      forwardRef(() => CckChipTheme),
      (theme: CckChipTheme) => ({ size: theme.size }),
    ),
  ],
})
export class CckChipTheme {
  /**
   * Height of the chip.
   */
  readonly size = input<CckChipSize | null>();
}
