'use client';

import type { ReactElement } from 'react';
import { getMenuProps, menuAnatomy } from '@cocokits/machines/menu';
import { usePartIcon } from '../internal/use-part-icon';
import { SvgIcon } from '../svg-icon';
import { useMenuContext } from './menu-context';
import { useMenuItemContext } from './menu-part-contexts';
import type { MenuSpanProps } from './menu-parts.types';
import type { MenuPart } from './menu.types';
import { useMenuPartElement } from './use-menu-part-element';

function MenuItemIndicatorImpl({ render, ref, children, ...rest }: MenuSpanProps): ReactElement {
  const context = useMenuContext('Menu.ItemIndicator');
  const { checked } = useMenuItemContext('Menu.ItemIndicator');
  const machine = getMenuProps({ id: context.id, open: context.open }, context.dispatch).itemIndicator({ checked });
  // Content you give wins; else the icon the theme names in `components.menu.icons.itemIndicator`, if any.
  const iconName = usePartIcon(menuAnatomy, 'itemIndicator', children);
  return useMenuPartElement('itemIndicator', 'span', machine, context.open, {
    render,
    ref,
    rest: { ...rest, children: iconName === undefined ? children : <SvgIcon iconName={iconName} /> },
  });
}

/**
 * The mark of a checkbox item or a radio item. It renders a decorative `<span aria-hidden="true">` with
 * `data-state` set to `checked` or `unchecked`, so the theme shows it only while the item is checked.
 *
 * Put an icon inside it, or leave it empty to draw the icon that the theme names for the part.
 *
 * @example
 * <Menu.CheckboxItem>
 *   <Menu.ItemIndicator />
 *   Show hidden files
 * </Menu.CheckboxItem>
 * @cckPart itemIndicator
 * @param props - The ItemIndicator props.
 * @returns The rendered span.
 */
export const MenuItemIndicator: MenuPart<MenuSpanProps> = Object.assign(MenuItemIndicatorImpl, {
  displayName: 'Menu.ItemIndicator',
});
