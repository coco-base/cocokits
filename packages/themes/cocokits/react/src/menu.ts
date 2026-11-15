import { Menu as BaseMenu } from '@cocokits/react/menu';
import { MenuContent } from './menu-content';

/** The cocokits {@link Menu} parts: the themed `Content` and the base parts. */
interface MenuNamespace {
  readonly Root: typeof BaseMenu.Root;
  readonly Trigger: typeof BaseMenu.Trigger;
  readonly Content: typeof MenuContent;
  readonly Item: typeof BaseMenu.Item;
}

/**
 * The cocokits Menu as a namespace: the themed `Menu.Content` and the base `Menu.Root`, `Menu.Trigger` and
 * `Menu.Item`, which the theme styles through the option of the content.
 */
export const Menu: MenuNamespace = {
  Root: BaseMenu.Root,
  Trigger: BaseMenu.Trigger,
  Content: MenuContent,
  Item: BaseMenu.Item,
};
