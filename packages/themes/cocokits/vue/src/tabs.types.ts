import type { TabsRootProps as BaseTabsRootProps } from '@cocokits/vue/tabs';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type TabsOptions = CocokitsThemeConfig['components']['tabs'];

/** The `variant` values of the cocokits theme. */
export type TabsVariant = TabsOptions['variant']['values'][number];
/** The `color` values of the cocokits theme. */
export type TabsColor = TabsOptions['color']['values'][number];
/** The `size` values of the cocokits theme. */
export type TabsSize = TabsOptions['size']['values'][number];
/** The `headerAlign` values of the cocokits theme. */
export type TabsHeaderAlign = TabsOptions['headerAlign']['values'][number];

/**
 * Props of the cocokits TabsRoot. It renders the base TabsRoot and supplies `variant`, `color`, `size` and
 * `headerAlign` to it, which renders the `data-*` attributes on the root. Each option resolves as own option, then
 * `ThemeProvider` override, then config default; `null` removes the attribute. Bind the value with `v-model`;
 * native attributes and listeners fall through to the base.
 *
 * @example
 * <TabsRoot v-model="tab" variant="line" color="brand" size="lg" header-align="stretch">
 *   <TabsList aria-label="Account settings">
 *     <TabsTrigger value="account">Account</TabsTrigger>
 *     <TabsIndicator />
 *   </TabsList>
 *   <TabsContent value="account">Change your name.</TabsContent>
 * </TabsRoot>
 *
 * @typeParam T - The type of a tab value: a `string` or a `number`. Defaults to `string`.
 * @cckPart root
 */
export interface TabsRootProps<T extends string | number = string> extends BaseTabsRootProps<T> {
  /**
   * Look of the list and the indicator.
   */
  readonly variant?: TabsVariant | null | undefined;
  /**
   * Color family of the indicator, rendered as `data-cck-color`.
   */
  readonly color?: TabsColor | null | undefined;
  /**
   * Height, padding and text of the triggers.
   */
  readonly size?: TabsSize | null | undefined;
  /**
   * Where the list sits across the tabs, or stretched over their whole width.
   */
  readonly headerAlign?: TabsHeaderAlign | null | undefined;
}
