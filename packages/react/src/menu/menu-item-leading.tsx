'use client';

import type { ReactElement } from 'react';
import { getMenuProps } from '@cocokits/machines/menu';
import { useMenuContext } from './menu-context';
import type { MenuSpanProps } from './menu-parts.types';
import type { MenuPart } from './menu.types';
import { useMenuPartElement } from './use-menu-part-element';

function MenuItemLeadingImpl({ render, ref, ...rest }: MenuSpanProps): ReactElement {
  const context = useMenuContext('Menu.ItemLeading');
  const machine = getMenuProps({ id: context.id, open: context.open }, context.dispatch).itemLeading;
  return useMenuPartElement('itemLeading', 'span', machine, context.open, { render, ref, rest });
}

/**
 * The content before the text of an item, such as an icon. It renders a decorative `<span aria-hidden="true">`, so
 * the text of the item names the item. An item with an icon only gets its name from `aria-label`.
 *
 * @example
 * <Menu.Item>
 *   <Menu.ItemLeading>...</Menu.ItemLeading>
 *   Edit
 * </Menu.Item>
 * @cckPart itemLeading
 * @param props - The ItemLeading props.
 * @returns The rendered span.
 */
export const MenuItemLeading: MenuPart<MenuSpanProps> = Object.assign(MenuItemLeadingImpl, {
  displayName: 'Menu.ItemLeading',
});
