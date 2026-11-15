import { Directive, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type MenuOptions = CocokitsThemeConfig['components']['menu'];

/** The `size` values of the cocokits theme. */
export type CckMenuSize = MenuOptions['size']['values'][number];

/**
 * The cocokits theme options of the Menu. It sits on the same element as the base content (`cck-menu-content`)
 * and provides the value to it; the base renders the `data-size` attribute on the content, and the theme sizes the
 * items from it. Each option resolves in order: the input, then the `provideCckTheme` override, then the config
 * default; `null` removes the attribute. The theme needs `provideCckTheme`; without it no theme attribute renders.
 *
 * @example
 * <ng-template cckMenuPortal>
 *   <cck-menu-content size="lg">
 *     <cck-menu-item>Rename</cck-menu-item>
 *   </cck-menu-content>
 * </ng-template>
 * @cckPart content
 */
@Directive({
  selector: 'cck-menu-content',
  providers: [
    provideThemeOptions(
      'menu',
      forwardRef(() => CckMenuTheme),
      (theme: CckMenuTheme) => ({ size: theme.size }),
    ),
  ],
})
export class CckMenuTheme {
  /**
   * Height of the items.
   */
  readonly size = input<CckMenuSize | null>();
}
