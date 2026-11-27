import type { MenuContentProps as BaseMenuContentProps } from '@cocokits/vue/menu';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type MenuOptions = CocokitsThemeConfig['components']['menu'];

/** The `size` values of the cocokits theme. */
export type MenuSize = MenuOptions['size']['values'][number];

/**
 * Props of the cocokits MenuContent. It renders the base MenuContent and supplies `size` to it, which renders
 * `data-size` on the content. The option resolves as own option, then `ThemeProvider` override, then config
 * default; `null` removes the attribute. Native attributes and listeners fall through to the base.
 *
 * @example
 * <MenuContent size="lg">
 *   <MenuItem>Edit</MenuItem>
 * </MenuContent>
 * @cckPart content
 */
export interface MenuContentProps extends BaseMenuContentProps {
  /**
   * Height of the items.
   */
  readonly size?: MenuSize | null | undefined;
}
