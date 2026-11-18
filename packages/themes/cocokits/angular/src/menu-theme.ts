import { Directive, computed, forwardRef, inject, input, type Signal } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import { resolveInheritedValue, type CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type MenuOptions = CocokitsThemeConfig['components']['menu'];

/** The `size` values of the cocokits theme. */
export type CckMenuSize = MenuOptions['size']['values'][number];
/** The `color` values of the cocokits theme. */
export type CckMenuItemColor = MenuOptions['color']['values'][number];

/**
 * The cocokits theme options of the Menu. It sits on the same element as the base content (`cck-menu-content`) or
 * submenu content (`cck-menu-sub-content`) and provides the value to it; the base renders the `data-size` attribute
 * on the content, and the theme sizes the items from it. The size resolves in order: the input, then (for a submenu
 * content) the size of the menu content around its sub-trigger, then the `provideCckTheme` override, then the config
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
  selector: 'cck-menu-content, cck-menu-sub-content',
  host: {
    '[attr.size]': 'null',
  },
  providers: [
    provideThemeOptions(
      'menu',
      forwardRef(() => CckMenuTheme),
      (theme: CckMenuTheme) => ({ size: theme._size }),
    ),
  ],
})
export class CckMenuTheme {
  /**
   * Height of the items.
   */
  readonly size = input<CckMenuSize | null>();
  private readonly parent = inject(CckMenuTheme, { skipSelf: true, optional: true });
  /** The size of the content: its own, else the one of the menu content around it. @internal */
  readonly _size: Signal<CckMenuSize | null | undefined> = computed(() =>
    resolveInheritedValue(this.size(), this.parent?._size()),
  );
}

/**
 * The cocokits theme option of the four kinds of Menu item: `cck-menu-item`, `cck-menu-checkbox-item`,
 * `cck-menu-radio-item` and `cck-menu-sub-trigger`. It sits on the same element as the base item and provides the
 * value to it; the base renders the `data-color` attribute. The option resolves in order: the input, then the
 * `provideCckTheme` override, then the config default; `null` removes the attribute. The theme needs
 * `provideCckTheme`; without it no theme attribute renders.
 *
 * @example
 * <cck-menu-item color="danger">Delete</cck-menu-item>
 * @cckPart item
 */
@Directive({
  selector: 'cck-menu-item, cck-menu-checkbox-item, cck-menu-radio-item, cck-menu-sub-trigger',
  host: {
    '[attr.color]': 'null',
  },
  providers: [
    provideThemeOptions(
      'menu',
      forwardRef(() => CckMenuItemTheme),
      (theme: CckMenuItemTheme) => ({ color: theme.color }),
    ),
  ],
})
export class CckMenuItemTheme {
  /**
   * Colour of the item: the text colour, or the danger colour for an action that cannot be undone.
   */
  readonly color = input<CckMenuItemColor | null>();
}
