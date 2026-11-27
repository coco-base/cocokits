import type {
  MenuCheckboxItemProps as BaseMenuCheckboxItemProps,
  MenuItemProps as BaseMenuItemProps,
  MenuRadioItemProps as BaseMenuRadioItemProps,
  MenuSubTriggerProps as BaseMenuSubTriggerProps,
} from '@cocokits/vue/menu';
import type { CocokitsThemeConfig } from '@cocokits/theme-cocokits';

type MenuOptions = CocokitsThemeConfig['components']['menu'];

/** The `color` values of the cocokits theme. */
export type MenuItemColor = MenuOptions['color']['values'][number];

/** The cocokits `color` of an item, the one option the four kinds of item share. */
interface MenuItemColorProp {
  /**
   * Colour of the item: the text colour, or the danger colour for an action that cannot be undone.
   */
  readonly color?: MenuItemColor | null | undefined;
}

/**
 * Props of the cocokits MenuItem. It renders the base MenuItem and supplies `color` to it, which renders
 * `data-color` on the item. The option resolves as own option, then `ThemeProvider` override, then config default;
 * `null` removes the attribute. Native attributes and listeners fall through to the base.
 *
 * @example
 * <MenuItem color="danger">Delete</MenuItem>
 * @cckPart item
 */
export interface MenuItemProps extends BaseMenuItemProps, MenuItemColorProp {}

/**
 * Props of the cocokits MenuCheckboxItem. It renders the base MenuCheckboxItem and supplies `color` to it, which
 * renders `data-color` on the item. The option resolves as the one of {@link MenuItemProps}.
 *
 * @example
 * <MenuCheckboxItem v-model="hidden" color="danger">Hide the list</MenuCheckboxItem>
 * @cckPart checkboxItem
 */
export interface MenuCheckboxItemProps extends BaseMenuCheckboxItemProps, MenuItemColorProp {}

/**
 * Props of the cocokits MenuRadioItem. It renders the base MenuRadioItem and supplies `color` to it, which renders
 * `data-color` on the item. The option resolves as the one of {@link MenuItemProps}.
 *
 * @example
 * <MenuRadioItem value="small" color="danger">Small</MenuRadioItem>
 * @cckPart radioItem
 */
export interface MenuRadioItemProps extends BaseMenuRadioItemProps, MenuItemColorProp {}

/**
 * Props of the cocokits MenuSubTrigger. It renders the base MenuSubTrigger and supplies `color` to it, which
 * renders `data-color` on the item. The option resolves as the one of {@link MenuItemProps}.
 *
 * @example
 * <MenuSubTrigger color="danger">Danger zone</MenuSubTrigger>
 * @cckPart subTrigger
 */
export interface MenuSubTriggerProps extends BaseMenuSubTriggerProps, MenuItemColorProp {}
