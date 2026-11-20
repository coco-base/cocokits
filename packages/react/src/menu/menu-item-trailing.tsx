'use client';

import type { ReactElement } from 'react';
import { getMenuProps } from '@cocokits/machines/menu';
import { useMenuContext } from './menu-context';
import type { MenuSpanProps } from './menu-parts.types';
import type { MenuPart } from './menu.types';
import { useMenuPartElement } from './use-menu-part-element';

function MenuItemTrailingImpl({ render, ref, ...rest }: MenuSpanProps): ReactElement {
  const context = useMenuContext('Menu.ItemTrailing');
  const machine = getMenuProps({ id: context.id, open: context.open }, context.dispatch).itemTrailing;
  return useMenuPartElement('itemTrailing', 'span', machine, context.open, { render, ref, rest });
}

/**
 * The content after the text of an item, such as an icon or a count. It renders a decorative `<span aria-
 * hidden="true">`, so the text of the item names the item.
 *
 * @example
 * <Menu.Item>
 *   <Menu.ItemTrailing>...</Menu.ItemTrailing>
 *   Edit
 * </Menu.Item>
 * @cckPart itemTrailing
 * @param props - The ItemTrailing props.
 * @returns The rendered span.
 */
export const MenuItemTrailing: MenuPart<MenuSpanProps> = Object.assign(MenuItemTrailingImpl, {
  displayName: 'Menu.ItemTrailing',
});
