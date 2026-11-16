'use client';

import { useContext, type ReactElement } from 'react';
import { getMenuProps } from '@cocokits/machines/menu';
import { isDevelopment } from '../internal/dev';
import { useIsomorphicLayoutEffect } from '../internal/use-isomorphic-layout-effect';
import { useMenuContext } from './menu-context';
import { MenuGroupContext } from './menu-part-contexts';
import type { MenuDivProps } from './menu-parts.types';
import type { MenuPart } from './menu.types';
import { useMenuPartElement } from './use-menu-part-element';

function MenuGroupLabelImpl({ render, ref, ...rest }: MenuDivProps): ReactElement {
  const context = useMenuContext('Menu.GroupLabel');
  const group = useContext(MenuGroupContext);
  if (group === null && isDevelopment()) {
    console.error('CocoKits: a <Menu.GroupLabel> must be placed within a <Menu.Group> or a <Menu.RadioGroup>.');
  }
  const registerLabel = group?.registerLabel;
  // The group is named by this label while it is mounted.
  useIsomorphicLayoutEffect(() => registerLabel?.(), [registerLabel]);
  const machine = getMenuProps({ id: context.id, open: context.open }, context.dispatch).groupLabel({
    id: group?.id ?? context.id,
  });
  return useMenuPartElement('groupLabel', 'div', machine, context.open, { render, ref, rest });
}

/**
 * The visible name of a `Menu.Group` or a `Menu.RadioGroup`. It renders a `<div>` that is not an item, so the arrow
 * keys skip it. The group points to it with `aria-labelledby` while it is mounted.
 *
 * @example
 * <Menu.Group>
 *   <Menu.GroupLabel>File</Menu.GroupLabel>
 *   <Menu.Item>Open</Menu.Item>
 * </Menu.Group>
 * @cckPart groupLabel
 * @param props - The GroupLabel props.
 * @returns The rendered div.
 */
export const MenuGroupLabel: MenuPart<MenuDivProps> = Object.assign(MenuGroupLabelImpl, {
  displayName: 'Menu.GroupLabel',
});
