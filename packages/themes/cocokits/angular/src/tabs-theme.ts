import { Directive, forwardRef, input } from '@angular/core';
import { provideThemeOptions } from '@cocokits/angular-core';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type TabsOptions = CocokitsThemeConfig['components']['tabs'];

/** The `variant` values of the cocokits theme. */
export type CckTabsVariant = TabsOptions['variant']['values'][number];
/** The `color` values of the cocokits theme. */
export type CckTabsColor = TabsOptions['color']['values'][number];
/** The `size` values of the cocokits theme. */
export type CckTabsSize = TabsOptions['size']['values'][number];
/** The `headerAlign` values of the cocokits theme. */
export type CckTabsHeaderAlign = TabsOptions['headerAlign']['values'][number];

/**
 * The cocokits theme options of the Tabs. It sits on the same element as the base component
 * (`[cckTabs]`) and provides the values to it; the base renders the `data-*` attributes on the root, and the
 * theme styles the list, the triggers and the indicator from them. Each option resolves in order: the input,
 * then the `provideCckTheme` override, then the config default; `null` removes the attribute. The theme needs
 * `provideCckTheme`; without it no theme attribute renders.
 *
 * @example
 * <div cckTabs variant="line" color="brand" size="lg" headerAlign="stretch" aria-label="Account settings">
 *   <div cckTab label="Account">Change your name.</div>
 * </div>
 * @cckPart root
 */
@Directive({
  selector: '[cckTabs]',
  providers: [
    provideThemeOptions(
      'tabs',
      forwardRef(() => CckTabsTheme),
      (theme: CckTabsTheme) => ({
        variant: theme.variant,
        color: theme.color,
        size: theme.size,
        headerAlign: theme.headerAlign,
      }),
    ),
  ],
})
export class CckTabsTheme {
  /**
   * Look of the list and the indicator.
   */
  readonly variant = input<CckTabsVariant | null>();
  /**
   * Color family of the indicator, rendered as `data-cck-color`.
   */
  readonly color = input<CckTabsColor | null>();
  /**
   * Height, padding and text of the triggers.
   */
  readonly size = input<CckTabsSize | null>();
  /**
   * Where the list sits across the tabs, or stretched over their whole width.
   */
  readonly headerAlign = input<CckTabsHeaderAlign | null>();
}
