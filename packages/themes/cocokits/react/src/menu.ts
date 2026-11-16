import { Menu as BaseMenu } from '@cocokits/react/menu';
import { MenuContent } from './menu-content';
import {
  MenuCheckboxItem,
  MenuItem,
  MenuRadioItem,
  MenuSubTrigger,
  type MenuCheckboxItemProps,
  type MenuItemComponent,
  type MenuItemProps,
  type MenuRadioItemProps,
  type MenuSubTriggerProps,
} from './menu-items';

/** The cocokits {@link Menu} parts: the themed `Content` and items, and the base parts. */
interface MenuNamespace {
  readonly Root: typeof BaseMenu.Root;
  readonly Trigger: typeof BaseMenu.Trigger;
  readonly Content: typeof MenuContent;
  readonly Item: MenuItemComponent<MenuItemProps>;
  readonly CheckboxItem: MenuItemComponent<MenuCheckboxItemProps>;
  readonly RadioGroup: typeof BaseMenu.RadioGroup;
  readonly RadioItem: MenuItemComponent<MenuRadioItemProps>;
  readonly ItemIndicator: typeof BaseMenu.ItemIndicator;
  readonly Group: typeof BaseMenu.Group;
  readonly GroupLabel: typeof BaseMenu.GroupLabel;
  readonly ItemLeading: typeof BaseMenu.ItemLeading;
  readonly ItemTrailing: typeof BaseMenu.ItemTrailing;
  readonly ItemSupportingText: typeof BaseMenu.ItemSupportingText;
  readonly ItemShortcut: typeof BaseMenu.ItemShortcut;
  readonly Sub: typeof BaseMenu.Sub;
  readonly SubTrigger: MenuItemComponent<MenuSubTriggerProps>;
  readonly SubContent: typeof BaseMenu.SubContent;
}

/**
 * The cocokits Menu as a namespace: the themed `Menu.Content` (it takes `size`, and so does the submenu content
 * through it) and the themed items `Menu.Item`, `Menu.CheckboxItem`, `Menu.RadioItem` and `Menu.SubTrigger` (they
 * take `color`), and the base `Menu.Root`, `Menu.Trigger`, `Menu.RadioGroup`, `Menu.ItemIndicator`, `Menu.Group`,
 * `Menu.GroupLabel`, `Menu.ItemLeading`, `Menu.ItemTrailing`, `Menu.ItemSupportingText`, `Menu.ItemShortcut`,
 * `Menu.Sub` and `Menu.SubContent`, which the theme styles. The submenu content takes the `size` of the content that
 * holds its sub-trigger.
 */
export const Menu: MenuNamespace = {
  Root: BaseMenu.Root,
  Trigger: BaseMenu.Trigger,
  Content: MenuContent,
  Item: MenuItem,
  CheckboxItem: MenuCheckboxItem,
  RadioGroup: BaseMenu.RadioGroup,
  RadioItem: MenuRadioItem,
  ItemIndicator: BaseMenu.ItemIndicator,
  Group: BaseMenu.Group,
  GroupLabel: BaseMenu.GroupLabel,
  ItemLeading: BaseMenu.ItemLeading,
  ItemTrailing: BaseMenu.ItemTrailing,
  ItemSupportingText: BaseMenu.ItemSupportingText,
  ItemShortcut: BaseMenu.ItemShortcut,
  Sub: BaseMenu.Sub,
  SubTrigger: MenuSubTrigger,
  SubContent: BaseMenu.SubContent,
};
