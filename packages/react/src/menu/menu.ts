import { MenuContent } from './menu-content';
import { MenuItem } from './menu-item';
import { MenuRoot } from './menu-root';
import { MenuTrigger } from './menu-trigger';
import type { MenuContentProps, MenuItemProps, MenuPart, MenuRootProps, MenuTriggerProps } from './menu.types';

/** The shape of the {@link Menu} namespace. */
interface MenuNamespace {
  readonly Root: MenuPart<MenuRootProps>;
  readonly Trigger: MenuPart<MenuTriggerProps>;
  readonly Content: MenuPart<MenuContentProps>;
  readonly Item: MenuPart<MenuItemProps>;
}

/**
 * The Menu parts as a namespace: `Menu.Root`, `Menu.Trigger`, `Menu.Content` and `Menu.Item`.
 * A button that opens a list of actions.
 */
export const Menu: MenuNamespace = {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
};
