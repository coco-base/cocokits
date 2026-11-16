import { toIdSegment } from '@cocokits/utils';
import type { MenuIds } from './menu.types';

/**
 * Derives the ids of the menu parts that link to each other.
 *
 * @param id - The id of the menu, from the adapter.
 * @returns The trigger and content ids.
 */
export function menuIds(id: string): MenuIds {
  return { trigger: `${id}-trigger`, content: `${id}-content` };
}

/**
 * The id of the supporting text of one item. It is made from the item's registration key, never from its text.
 *
 * @param id - The id of the menu, from the adapter.
 * @param key - The item's key.
 * @returns The id the item's `aria-describedby` points at.
 */
export function menuItemDescriptionId(id: string, key: string): string {
  return `${id}-item-${toIdSegment(key)}-description`;
}

/**
 * The id of the label of one group.
 *
 * @param groupId - The id of the group, from the adapter.
 * @returns The id the group's `aria-labelledby` points at.
 */
export function menuGroupLabelId(groupId: string): string {
  return `${groupId}-label`;
}
