'use client';

import type { ReactElement } from 'react';
import { getMenuProps } from '@cocokits/machines/menu';
import { useMenuContext } from './menu-context';
import type { MenuSpanProps } from './menu-parts.types';
import type { MenuPart } from './menu.types';
import { useMenuPartElement } from './use-menu-part-element';

function MenuItemShortcutImpl({ render, ref, ...rest }: MenuSpanProps): ReactElement {
  const context = useMenuContext('Menu.ItemShortcut');
  const machine = getMenuProps({ id: context.id, open: context.open }, context.dispatch).itemShortcut;
  return useMenuPartElement('itemShortcut', 'span', machine, context.open, { render, ref, rest });
}

/**
 * The keyboard shortcut of an item, such as the text `Ctrl+S`. It renders a `<span>` after the text. It only shows
 * the shortcut; it does not run it.
 *
 * @example
 * <Menu.Item>
 *   <Menu.ItemShortcut>...</Menu.ItemShortcut>
 *   Edit
 * </Menu.Item>
 * @cckPart itemShortcut
 * @param props - The ItemShortcut props.
 * @returns The rendered span.
 */
export const MenuItemShortcut: MenuPart<MenuSpanProps> = Object.assign(MenuItemShortcutImpl, {
  displayName: 'Menu.ItemShortcut',
});
