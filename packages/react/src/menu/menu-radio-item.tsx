'use client';

import { useContext, type ReactElement } from 'react';
import { isDevelopment } from '../internal/dev';
import { MenuRadioGroupContext } from './menu-part-contexts';
import type { MenuRadioItemProps } from './menu-parts.types';
import type { MenuPart } from './menu.types';
import { useMenuItem } from './use-menu-item';

function MenuRadioItemImpl({
  value,
  disabled = false,
  onSelect,
  render,
  ref,
  ...rest
}: MenuRadioItemProps): ReactElement {
  const group = useContext(MenuRadioGroupContext);
  if (group === null && isDevelopment()) {
    console.error('CocoKits: a <Menu.RadioItem> must be placed within a <Menu.RadioGroup>.');
  }
  return useMenuItem(
    {
      kind: 'radio',
      checked: group !== null && group.value === value,
      value,
      disabled,
      onSelect,
      onChange: (change, event) => {
        if (change.type === 'radio') group?.setValue(change.value, event);
      },
    },
    { part: 'Menu.RadioItem', render, ref, rest },
  );
}

/**
 * An item that sets the value of its `Menu.RadioGroup`. It renders a `<div role="menuitemradio">` with
 * `aria-checked` and `data-state`. It is checked while its `value` is the value of the group.
 *
 * Enter and a click check it and close the menu, as for any item. Space checks it and keeps the menu open. A press
 * on the checked item changes nothing. Put a `Menu.ItemIndicator` inside it to show the state.
 *
 * @example
 * <Menu.RadioItem value="name">
 *   <Menu.ItemIndicator />
 *   Name
 * </Menu.RadioItem>
 * @cckPart radioItem
 * @param props - The RadioItem props.
 * @returns The rendered element.
 */
export const MenuRadioItem: MenuPart<MenuRadioItemProps> = Object.assign(MenuRadioItemImpl, {
  displayName: 'Menu.RadioItem',
});
