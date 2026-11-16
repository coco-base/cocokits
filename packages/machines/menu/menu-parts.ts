import { menuGroupLabelId, menuItemDescriptionId } from './menu-ids';
import { menuAnatomy } from './menu.anatomy';
import type { MenuGroupEntry, MenuGroupProps, MenuItemContentParts } from './menu-parts.types';

function groupProps(entry: MenuGroupEntry, className: string): MenuGroupProps {
  return {
    class: className,
    role: 'group',
    'aria-labelledby': entry.hasLabel === true ? menuGroupLabelId(entry.id) : undefined,
  };
}

/**
 * Computes the props of the groups and of the parts inside an item: the group and its label, the radio group, the
 * item indicator, leading, trailing, supporting text and shortcut. Pure.
 *
 * @param menuId - The id of the menu, from the adapter.
 * @returns The props of each part (a function where the part depends on an entry).
 */
export function getMenuItemContentParts(menuId: string): MenuItemContentParts {
  const { classes } = menuAnatomy;
  return {
    group: (entry) => groupProps(entry, classes.group),
    groupLabel: (entry) => ({ class: classes.groupLabel, id: menuGroupLabelId(entry.id) }),
    radioGroup: (entry) => groupProps(entry, classes.radioGroup),
    itemIndicator: (entry) => ({
      class: classes.itemIndicator,
      'aria-hidden': 'true',
      'data-state': entry.checked === true ? 'checked' : 'unchecked',
    }),
    itemLeading: { class: classes.itemLeading, 'aria-hidden': 'true' },
    itemTrailing: { class: classes.itemTrailing, 'aria-hidden': 'true' },
    itemSupportingText: (entry) => ({
      class: classes.itemSupportingText,
      id: menuItemDescriptionId(menuId, entry.key),
    }),
    itemShortcut: { class: classes.itemShortcut },
  };
}
