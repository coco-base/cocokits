'use client';

import type { ReactElement } from 'react';
import { getMenuProps } from '@cocokits/machines/menu';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMenuContext } from './menu-context';
import { useMenuItemContext } from './menu-part-contexts';
import type { MenuSpanProps } from './menu-parts.types';
import type { MenuPart } from './menu.types';
import { useMenuPartElement } from './use-menu-part-element';

function MenuItemSupportingTextImpl({ render, ref, ...rest }: MenuSpanProps): ReactElement {
  const context = useMenuContext('Menu.ItemSupportingText');
  const item = useMenuItemContext('Menu.ItemSupportingText');
  const { registerDescription } = item;
  // The item is described by this text while it is mounted.
  useIsomorphicLayoutEffect(() => registerDescription(), [registerDescription]);
  const machine = getMenuProps({ id: context.id, open: context.open }, context.dispatch).itemSupportingText({
    key: item.key,
  });
  return useMenuPartElement('itemSupportingText', 'span', machine, context.open, { render, ref, rest });
}

/**
 * A second line of text under the text of an item, such as a hint. It renders a `<span>`, and the item points to it
 * with `aria-describedby` while it is mounted, so a screen reader reads it after the name of the item.
 *
 * @example
 * <Menu.Item>
 *   Delete
 *   <Menu.ItemSupportingText>This cannot be undone.</Menu.ItemSupportingText>
 * </Menu.Item>
 * @cckPart itemSupportingText
 * @param props - The ItemSupportingText props.
 * @returns The rendered span.
 */
export const MenuItemSupportingText: MenuPart<MenuSpanProps> = Object.assign(MenuItemSupportingTextImpl, {
  displayName: 'Menu.ItemSupportingText',
});
