'use client';

import type { ReactElement } from 'react';
import { useMenuItem } from './use-menu-item';
import type { MenuItemProps, MenuPart } from './menu.types';

function MenuItemImpl({ disabled = false, onSelect, render, ref, ...rest }: MenuItemProps): ReactElement {
  return useMenuItem({ kind: 'item', checked: false, disabled, onSelect }, { part: 'Menu.Item', render, ref, rest });
}

/**
 * One action of the menu. It renders a `<div role="menuitem">`. Native `div` props pass through, and `ref` reaches
 * the element.
 *
 * Only one item is a tab stop: the one that has the focus, or had it last. Arrow keys, Home, End and typing move
 * the focus between items. A disabled item stays in that order and runs nothing.
 *
 * Put `Menu.ItemLeading`, `Menu.ItemTrailing`, `Menu.ItemSupportingText` and `Menu.ItemShortcut` inside it for an
 * icon before the text, an icon after it, a second line and a keyboard shortcut. The supporting text also
 * describes the item.
 *
 * To render a link, use `render`. Enter and Space click the item, so the link is followed.
 *
 * @example
 * <Menu.Item onSelect={() => remove()}>Delete</Menu.Item>
 * @example
 * <Menu.Item render={<a href="/settings" />}>Settings</Menu.Item>
 * @cckPart item
 * @param props - The Item props.
 * @returns The rendered element.
 */
export const MenuItem: MenuPart<MenuItemProps> = Object.assign(MenuItemImpl, {
  displayName: 'Menu.Item',
});
