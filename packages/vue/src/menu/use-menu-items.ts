import { computed, shallowRef, type ComputedRef, type ShallowRef } from 'vue';
import { createTypeahead, type Typeahead } from '@cocokits/cdk/roving-focus';
import { getMenuItemChange, type MenuEvent, type MenuItemEntry } from '@cocokits/machines/menu';
import type { MenuItemRegistration } from './menu.context';
import { useMenuRegistry } from './use-menu-registry';

/** What {@link useMenuItems} returns. */
export interface MenuItems {
  /** The registered items, in document order. */
  readonly items: ShallowRef<readonly MenuItemRegistration[]>;
  /** Registers (or updates) an item; returns the function that removes it. */
  readonly registerItem: (item: MenuItemRegistration) => () => void;
  /** The registered items as the machine reads them. */
  readonly entries: ComputedRef<readonly MenuItemEntry[]>;
  /** The type-to-find buffer of the menu. */
  readonly typeahead: Typeahead;
  /** The key of the item that has or last had focus. */
  readonly activeKey: ShallowRef<string | undefined>;
  /** Starts the next search and the next tab stop afresh. */
  readonly reset: () => void;
  /** Tells the listeners that the pointer moved over the item with this key. */
  readonly pointerMoved: (key: string, event: Event) => void;
  /** Listens for `pointerMoved`; returns the function that stops. */
  readonly onPointerMoved: (listener: (key: string, event: Event) => void) => () => void;
  /**
   * Handles the events about items: focus, moves, presses, checks and the pointer. A press (`ITEM.RUN`) applies the
   * change of a checkbox or radio item first and leaves the close to the caller.
   *
   * @param event - The event a part sent.
   * @returns `'handled'` when nothing is left to do, `'continue'` when the caller decides the rest.
   */
  readonly handle: (event: MenuEvent) => 'handled' | 'continue';
}

/**
 * The items of one menu (the root, or the content of a submenu): the registry, the active item, the type-to-find
 * buffer, and the handling of the events about items that the root and a submenu share.
 *
 * @internal
 * @returns The items and how to handle their events.
 */
export function useMenuItems(): MenuItems {
  const registry = useMenuRegistry();
  const typeahead = createTypeahead();
  const activeKey = shallowRef<string | undefined>(undefined);
  const listeners = new Set<(key: string, event: Event) => void>();

  const entries = computed<readonly MenuItemEntry[]>(() =>
    registry.items.value.map((item) => ({
      key: item.key,
      disabled: item.disabled,
      // Read when a key is pressed: an item can change its text without a new registration.
      get text() {
        return item.element.textContent;
      },
      get kind() {
        return item.kind;
      },
      get checked() {
        return item.checked;
      },
      get value() {
        return item.value;
      },
      get hasDescription() {
        return item.hasDescription;
      },
    })),
  );

  function itemElement(key: string): HTMLElement | undefined {
    return registry.items.value.find((item) => item.key === key)?.element;
  }

  /** Applies what a press on a checkbox or radio item asks for. */
  function applyChange(key: string): void {
    const item = registry.items.value.find((candidate) => candidate.key === key);
    if (!item) return;
    const change = getMenuItemChange({
      key,
      text: '',
      disabled: item.disabled,
      kind: item.kind,
      checked: item.checked,
      value: item.value,
    });
    if (change) item.change(change);
  }

  function pointerMoved(key: string, event: Event): void {
    listeners.forEach((listener) => {
      listener(key, event);
    });
  }

  function handle(event: MenuEvent): 'handled' | 'continue' {
    switch (event.type) {
      case 'ITEM.FOCUS':
        activeKey.value = event.key;
        return 'handled';
      case 'ITEM.PRESS':
        // The click runs the item as a pointer does, so a link item follows its link.
        itemElement(event.key)?.click();
        return 'handled';
      case 'CONTENT.MOVE':
        itemElement(event.key)?.focus();
        return 'handled';
      case 'ITEM.CHECK':
        applyChange(event.key);
        return 'handled';
      case 'ITEM.POINTER_MOVE':
        pointerMoved(event.key, event.event);
        return 'handled';
      case 'ITEM.RUN':
        if (!event.disabled) applyChange(event.key);
        return 'continue';
      default:
        return 'continue';
    }
  }

  return {
    items: registry.items,
    registerItem: registry.registerItem,
    entries,
    typeahead,
    activeKey,
    reset: () => {
      typeahead.reset();
      activeKey.value = undefined;
    },
    pointerMoved,
    onPointerMoved: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    handle,
  };
}
