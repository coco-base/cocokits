import { MenuContent } from './menu-content';
import { MenuCheckboxItem } from './menu-checkbox-item';
import { MenuRadioGroup } from './menu-radio-group';
import { MenuRadioItem } from './menu-radio-item';
import { MenuItemIndicator } from './menu-item-indicator';
import { MenuGroup } from './menu-group';
import { MenuGroupLabel } from './menu-group-label';
import { MenuItemLeading } from './menu-item-leading';
import { MenuItemTrailing } from './menu-item-trailing';
import { MenuItemSupportingText } from './menu-item-supporting-text';
import { MenuItemShortcut } from './menu-item-shortcut';
import { MenuSub } from './menu-sub';
import { MenuSubTrigger } from './menu-sub-trigger';
import { MenuSubContent } from './menu-sub-content';
import { MenuItem } from './menu-item';
import { MenuRoot } from './menu-root';
import { MenuTrigger } from './menu-trigger';
import type {
  MenuCheckboxItemProps,
  MenuDivProps,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuSpanProps,
  MenuSubContentProps,
  MenuSubProps,
  MenuSubTriggerProps,
} from './menu-parts.types';
import type { MenuContentProps, MenuItemProps, MenuPart, MenuRootProps, MenuTriggerProps } from './menu.types';

/** The shape of the {@link Menu} namespace. */
interface MenuNamespace {
  readonly Root: MenuPart<MenuRootProps>;
  readonly Trigger: MenuPart<MenuTriggerProps>;
  readonly Content: MenuPart<MenuContentProps>;
  readonly Item: MenuPart<MenuItemProps>;
  readonly CheckboxItem: MenuPart<MenuCheckboxItemProps>;
  readonly RadioGroup: MenuPart<MenuRadioGroupProps>;
  readonly RadioItem: MenuPart<MenuRadioItemProps>;
  readonly ItemIndicator: MenuPart<MenuSpanProps>;
  readonly Group: MenuPart<MenuDivProps>;
  readonly GroupLabel: MenuPart<MenuDivProps>;
  readonly ItemLeading: MenuPart<MenuSpanProps>;
  readonly ItemTrailing: MenuPart<MenuSpanProps>;
  readonly ItemSupportingText: MenuPart<MenuSpanProps>;
  readonly ItemShortcut: MenuPart<MenuSpanProps>;
  readonly Sub: MenuPart<MenuSubProps>;
  readonly SubTrigger: MenuPart<MenuSubTriggerProps>;
  readonly SubContent: MenuPart<MenuSubContentProps>;
}

/**
 * The Menu parts as a namespace: `Menu.Root`, `Menu.Trigger`, `Menu.Content`, `Menu.Item`, `Menu.CheckboxItem`,
 * `Menu.RadioGroup`, `Menu.RadioItem`, `Menu.ItemIndicator`, `Menu.Group`, `Menu.GroupLabel`, `Menu.ItemLeading`,
 * `Menu.ItemTrailing`, `Menu.ItemSupportingText`, `Menu.ItemShortcut`, `Menu.Sub`, `Menu.SubTrigger` and
 * `Menu.SubContent`. A button that opens a list of actions.
 */
export const Menu: MenuNamespace = {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  CheckboxItem: MenuCheckboxItem,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  ItemIndicator: MenuItemIndicator,
  Group: MenuGroup,
  GroupLabel: MenuGroupLabel,
  ItemLeading: MenuItemLeading,
  ItemTrailing: MenuItemTrailing,
  ItemSupportingText: MenuItemSupportingText,
  ItemShortcut: MenuItemShortcut,
  Sub: MenuSub,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuSubContent,
};
