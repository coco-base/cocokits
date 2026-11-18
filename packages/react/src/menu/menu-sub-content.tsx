'use client';

import type { ReactElement } from 'react';
import { MenuContent } from './menu-content';
import { MenuContext } from './menu-context';
import { useMenuSubContext } from './menu-part-contexts';
import type { MenuSubContentProps } from './menu-parts.types';
import type { MenuPart } from './menu.types';

function MenuSubContentImpl(props: MenuSubContentProps): ReactElement {
  const sub = useMenuSubContext('Menu.SubContent');
  // The items inside read the submenu as their menu: its own items, its own keys, its own open state.
  return (
    <MenuContext.Provider value={sub.menu}>
      <MenuContent {...props} />
    </MenuContext.Provider>
  );
}

/**
 * The panel of a submenu. It renders a `<div role="menu">` in the overlay container, named by its sub-trigger. It
 * renders nothing while closed, on the server and in the first client render.
 *
 * It opens at the bottom-end corner of the sub-trigger. With no room there, it moves to the start side, then above;
 * `data-side` says where it is. A key that opens it moves the focus to its first item.
 *
 * Left Arrow (Right Arrow in `rtl`) and Escape close only the submenu and return the focus to the sub-trigger. An
 * item of the submenu closes the whole menu, and Tab leaves the menu.
 *
 * @example
 * <Menu.SubContent>
 *   <Menu.Item>Email</Menu.Item>
 *   <Menu.Item>Link</Menu.Item>
 * </Menu.SubContent>
 * @cckPart subContent
 * @param props - The SubContent props.
 * @returns The portal, or nothing while closed.
 */
export const MenuSubContent: MenuPart<MenuSubContentProps> = Object.assign(MenuSubContentImpl, {
  displayName: 'Menu.SubContent',
});
