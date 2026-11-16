import { dataAttr } from '@cocokits/utils';
import { menuItemDescriptionId } from './menu-ids';
import { createMenuItemKeyDown, resolveMenuActiveKey } from './menu-keyboard';
import { menuAnatomy } from './menu.anatomy';
import type { MenuEvent, MenuItemChange, MenuItemEntry, MenuItemProps, MenuState } from './menu.types';

/**
 * What a press on an item asks for besides closing the menu: a checkbox item toggles its state, a radio item sets
 * the value of its group. Pure. The adapter applies it when it handles `ITEM.RUN` and `ITEM.CHECK`, and reports it
 * with its reason.
 *
 * @param entry - The item that was pressed.
 * @returns The change, or `null` for a plain item, a disabled item, and a radio item that is already checked.
 */
export function getMenuItemChange(entry: MenuItemEntry): MenuItemChange | null {
  if (entry.disabled === true) return null;
  if (entry.kind === 'checkbox') {
    return { type: 'checkbox', key: entry.key, checked: entry.checked !== true, reason: 'user' };
  }
  if (entry.kind === 'radio' && entry.checked !== true && entry.value !== undefined) {
    return { type: 'radio', key: entry.key, value: entry.value, reason: 'user' };
  }
  return null;
}

const ROLES = { item: 'menuitem', checkbox: 'menuitemcheckbox', radio: 'menuitemradio' } as const;

function itemClass(kind: MenuItemEntry['kind']): string {
  const { classes } = menuAnatomy;
  if (kind === 'checkbox') return classes.checkboxItem;
  return kind === 'radio' ? classes.radioItem : classes.item;
}

/**
 * Computes the props of one item: a plain item, a checkbox item (`menuitemcheckbox`) or a radio item
 * (`menuitemradio`). Checkbox and radio items add `aria-checked`, `data-state` and `data-highlighted`. Pure.
 *
 * @param state - The menu state.
 * @param entry - The item.
 * @param send - Receives the events of the handlers.
 * @returns The item props.
 */
export function getMenuItemProps(
  state: MenuState,
  entry: MenuItemEntry,
  send: (event: MenuEvent) => void,
): MenuItemProps {
  const kind = entry.kind ?? 'item';
  const checkable = kind !== 'item';
  const checked = entry.checked === true;
  const activeKey = resolveMenuActiveKey(state);
  return {
    class: itemClass(kind),
    role: ROLES[kind],
    tabIndex: entry.key === activeKey ? 0 : -1,
    'aria-checked': checkable ? (checked ? 'true' : 'false') : undefined,
    'aria-disabled': entry.disabled ? 'true' : undefined,
    'aria-describedby': entry.hasDescription === true ? menuItemDescriptionId(state.id, entry.key) : undefined,
    'data-state': checkable ? (checked ? 'checked' : 'unchecked') : undefined,
    'data-disabled': entry.disabled ? '' : undefined,
    'data-highlighted': checkable ? dataAttr(state.open && entry.key === activeKey) : undefined,
    onClick: (event) => {
      if (!event.defaultPrevented) send({ type: 'ITEM.RUN', key: entry.key, disabled: entry.disabled === true, event });
    },
    onFocus: () => {
      send({ type: 'ITEM.FOCUS', key: entry.key });
    },
    onPointerMove: (event) => {
      send({ type: 'ITEM.POINTER_MOVE', key: entry.key, event });
    },
    onKeyDown: createMenuItemKeyDown(state, entry, send),
  };
}
