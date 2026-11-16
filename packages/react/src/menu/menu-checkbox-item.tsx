'use client';

import type { ReactElement } from 'react';
import { useControllableState } from '../internal/use-controllable-state';
import type { MenuCheckboxItemProps, MenuItemChangeDetails } from './menu-parts.types';
import type { MenuPart } from './menu.types';
import { useMenuItem } from './use-menu-item';

function MenuCheckboxItemImpl({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  onSelect,
  render,
  ref,
  ...rest
}: MenuCheckboxItemProps): ReactElement {
  const [checked, setChecked] = useControllableState<boolean, MenuItemChangeDetails>({
    value: checkedProp,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
    name: '<Menu.CheckboxItem checked>',
  });
  return useMenuItem(
    {
      kind: 'checkbox',
      checked,
      disabled,
      onSelect,
      onChange: (change, event) => {
        if (change.type === 'checkbox') setChecked(change.checked, { reason: change.reason, event });
      },
    },
    { part: 'Menu.CheckboxItem', render, ref, rest },
  );
}

/**
 * An item that turns a setting on or off. It renders a `<div role="menuitemcheckbox">` with `aria-checked` and
 * `data-state`. Use it instead of a Checkbox inside a menu: the menu roles that screen readers expect, the focus
 * that stays in the menu, the menu keys, and a click that would otherwise act twice.
 *
 * Enter and a click toggle it and close the menu, as for any item. Space toggles it and keeps the menu open.
 *
 * Control it with `checked` and `onCheckedChange`. The items of a closed menu are not in the document, so a state
 * that you do not control starts again at `defaultChecked` each time the menu opens. Put a `Menu.ItemIndicator`
 * inside it to show the state.
 *
 * @example
 * <Menu.CheckboxItem defaultChecked>
 *   <Menu.ItemIndicator />
 *   Show hidden files
 * </Menu.CheckboxItem>
 * @cckPart checkboxItem
 * @param props - The CheckboxItem props.
 * @returns The rendered element.
 */
export const MenuCheckboxItem: MenuPart<MenuCheckboxItemProps> = Object.assign(MenuCheckboxItemImpl, {
  displayName: 'Menu.CheckboxItem',
});
