import { toIdSegment } from '@cocokits/utils';
import type { SelectIds, SelectItem } from './select.types';

/**
 * Derives the ids of the Select parts that link to each other.
 *
 * @param id - The id of the Select, from the adapter.
 * @param controlId - The control id a FormField gives the trigger; leave it out outside a field.
 * @returns The trigger, list and validation message ids.
 */
export function selectIds(id: string, controlId?: string): SelectIds {
  return { trigger: controlId ?? `${id}-trigger`, content: `${id}-content`, validationMessage: `${id}-validation` };
}

/**
 * The id of one option. It is made from the registration key, never from the option's value.
 *
 * @param id - The id of the Select.
 * @param key - The option's registration key.
 * @returns The option id.
 */
export function selectOptionId(id: string, key: string): string {
  return `${id}-option-${toIdSegment(key)}`;
}

/**
 * The id of one option element: the option's own `id`, else the one made from the Select id and the key.
 *
 * @param id - The id of the Select.
 * @param item - The option (its `key` and optional `id`).
 * @returns The element id, also the trigger's `aria-activedescendant` while it is highlighted.
 */
export function selectItemId(id: string, item: Pick<SelectItem<unknown>, 'key' | 'id'>): string {
  return item.id ?? selectOptionId(id, item.key);
}

/**
 * The id of the description of one option: the option element id and `-description`.
 *
 * @param id - The id of the Select.
 * @param item - The option (its `key` and optional `id`).
 * @returns The description id, also the option's `aria-describedby`.
 */
export function selectOptionDescriptionId(id: string, item: Pick<SelectItem<unknown>, 'key' | 'id'>): string {
  return `${selectItemId(id, item)}-description`;
}
