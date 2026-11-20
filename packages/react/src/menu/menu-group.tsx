'use client';

import { useCallback, useId, useMemo, useState, type ReactElement } from 'react';
import { getMenuProps } from '@cocokits/machines/menu';
import { useMenuContext } from './menu-context';
import { MenuGroupContext, type MenuGroupContextValue } from './menu-part-contexts';
import type { MenuDivProps } from './menu-parts.types';
import type { MenuPart } from './menu.types';
import { useMenuPartElement } from './use-menu-part-element';

function MenuGroupImpl({ render, ref, ...rest }: MenuDivProps): ReactElement {
  const context = useMenuContext('Menu.Group');
  const id = useId();
  const [labels, setLabels] = useState(0);
  const registerLabel = useCallback((): (() => void) => {
    setLabels((count) => count + 1);
    return () => {
      setLabels((count) => count - 1);
    };
  }, []);
  const machine = getMenuProps({ id: context.id, open: context.open }, context.dispatch).group({
    id,
    hasLabel: labels > 0,
  });
  const group = useMemo<MenuGroupContextValue>(() => ({ id, registerLabel }), [id, registerLabel]);
  const element = useMenuPartElement('group', 'div', machine, context.open, { render, ref, rest });
  return <MenuGroupContext.Provider value={group}>{element}</MenuGroupContext.Provider>;
}

/**
 * A set of related items. It renders a `<div role="group">`. A `Menu.GroupLabel` inside it names it; give the group
 * an `aria-label` for another name.
 *
 * @example
 * <Menu.Group>
 *   <Menu.GroupLabel>File</Menu.GroupLabel>
 *   <Menu.Item>Open</Menu.Item>
 *   <Menu.Item>Save</Menu.Item>
 * </Menu.Group>
 * @cckPart group
 * @param props - The Group props.
 * @returns The rendered div inside its context.
 */
export const MenuGroup: MenuPart<MenuDivProps> = Object.assign(MenuGroupImpl, {
  displayName: 'Menu.Group',
});
