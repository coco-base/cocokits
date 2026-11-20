import type { TabNavRootProps as BaseTabNavRootProps } from '@cocokits/vue/tab-nav';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type TabNavOptions = CocokitsThemeConfig['components']['tab-nav'];

/** The `variant` values of the cocokits theme. */
export type TabNavVariant = TabNavOptions['variant']['values'][number];
/** The `color` values of the cocokits theme. */
export type TabNavColor = TabNavOptions['color']['values'][number];
/** The `size` values of the cocokits theme. */
export type TabNavSize = TabNavOptions['size']['values'][number];
/** The `headerAlign` values of the cocokits theme. */
export type TabNavHeaderAlign = TabNavOptions['headerAlign']['values'][number];

/**
 * Props of the cocokits TabNavRoot. It renders the base TabNavRoot and supplies `variant`, `color`, `size` and
 * `headerAlign` to it, which renders the `data-*` attributes on the root (the same options as the Tabs). Each option
 * resolves as own option, then `ThemeProvider` override, then config default; `null` removes the attribute. Native
 * attributes and listeners fall through to the base.
 *
 * @example
 * <TabNavRoot aria-label="Project" variant="line" color="brand" size="lg" header-align="stretch">
 *   <TabNavList>
 *     <TabNavLink href="#overview" active>Overview</TabNavLink>
 *     <TabNavIndicator />
 *   </TabNavList>
 * </TabNavRoot>
 * @cckPart root
 */
export interface TabNavRootProps extends BaseTabNavRootProps {
  /**
   * Look of the list and the indicator.
   */
  readonly variant?: TabNavVariant | null | undefined;
  /**
   * Color family of the indicator, rendered as `data-cck-color`.
   */
  readonly color?: TabNavColor | null | undefined;
  /**
   * Height, padding and text of the links.
   */
  readonly size?: TabNavSize | null | undefined;
  /**
   * Where the list sits across the links, or stretched over their whole width.
   */
  readonly headerAlign?: TabNavHeaderAlign | null | undefined;
}
