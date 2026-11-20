import { shallowRef, watch, type ShallowRef } from 'vue';
import { sortByDomOrder } from '@cocokits/utils';
import type { MenuItemRegistration } from './menu.context';

/** What {@link useMenuRegistry} returns. */
export interface MenuRegistry {
  /** The registered items, in document order. */
  readonly items: ShallowRef<readonly MenuItemRegistration[]>;
  /** Registers (or updates) an item; returns the function that removes it. */
  readonly registerItem: (item: MenuItemRegistration) => () => void;
}

/**
 * The items that have mounted. They mount with the content, so the registry is empty while the menu is closed.
 * After every change it is put in document order, because a late or moved item registers out of order.
 *
 * @internal
 * @returns The registry and the registering function.
 */
export function useMenuRegistry(): MenuRegistry {
  const items = shallowRef<readonly MenuItemRegistration[]>([]);

  function registerItem(item: MenuItemRegistration): () => void {
    const current = items.value;
    const index = current.findIndex((candidate) => candidate.key === item.key);
    items.value = index === -1 ? [...current, item] : current.map((at, i) => (i === index ? item : at));
    return () => {
      items.value = items.value.filter((candidate) => candidate.key !== item.key);
    };
  }

  watch(
    items,
    (current) => {
      const byElement = new Map(current.map((item) => [item.element, item]));
      const sorted = sortByDomOrder(current.map((item) => item.element)).flatMap((element) => {
        const item = byElement.get(element);
        return item ? [item] : [];
      });
      if (sorted.some((item, index) => item !== current[index])) items.value = sorted;
    },
    { flush: 'post' },
  );

  return { items, registerItem };
}
