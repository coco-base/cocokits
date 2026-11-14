import { Directive, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type TabNavOptions = CocokitsThemeConfig['components']['tab-nav'];

/** The `variant` values of the cocokits theme. */
export type CckTabNavVariant = TabNavOptions['variant']['values'][number];
/** The `color` values of the cocokits theme. */
export type CckTabNavColor = TabNavOptions['color']['values'][number];
/** The `size` values of the cocokits theme. */
export type CckTabNavSize = TabNavOptions['size']['values'][number];
/** The `headerAlign` values of the cocokits theme. */
export type CckTabNavHeaderAlign = TabNavOptions['headerAlign']['values'][number];

/**
 * The cocokits theme options of the TabNav (the same as the Tabs). It sits on the same element as the base component
 * (`nav[cckTabNav]`) and provides the values to it; the base renders the `data-*` attributes on the root, and the
 * theme styles the list, the links and the indicator from them. Each option resolves in order: the input,
 * then the `provideCckTheme` override, then the config default; `null` removes the attribute. The theme needs
 * `provideCckTheme`; without it no theme attribute renders.
 *
 * @example
 * <nav cckTabNav variant="line" color="brand" size="lg" headerAlign="stretch" aria-label="Project">
 *   <a cckTabNavLink href="#overview" active>Overview</a>
 * </nav>
 * @cckPart root
 */
@Directive({
  selector: 'nav[cckTabNav]',
  providers: [
    provideThemeOptions(
      'tab-nav',
      forwardRef(() => CckTabNavTheme),
      (theme: CckTabNavTheme) => ({
        variant: theme.variant,
        color: theme.color,
        size: theme.size,
        headerAlign: theme.headerAlign,
      }),
    ),
  ],
})
export class CckTabNavTheme {
  /**
   * Look of the list and the indicator.
   */
  readonly variant = input<CckTabNavVariant | null>();
  /**
   * Color family of the indicator, rendered as `data-cck-color`.
   */
  readonly color = input<CckTabNavColor | null>();
  /**
   * Height, padding and text of the links.
   */
  readonly size = input<CckTabNavSize | null>();
  /**
   * Where the list sits across the links, or stretched over their whole width.
   */
  readonly headerAlign = input<CckTabNavHeaderAlign | null>();
}
