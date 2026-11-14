import { createMenuContentKeyDown, createMenuTriggerKeyDown } from './menu-keyboard';
import { menuAnatomy } from './menu.anatomy';
import type {
  MenuEvent,
  MenuIds,
  MenuItemEntry,
  MenuItemProps,
  MenuParts,
  MenuState,
  MenuTransition,
} from './menu.types';

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
 * Decides the open change an event asks for. Pure. Only the trigger events act while the menu is closed.
 *
 * @param state - The menu state.
 * @param event - The event a handler or the layer stack sent.
 * @returns The requested state and its reason, or `null` when nothing would change (also for the events that
 * only move focus).
 */
export function transitionMenu(state: MenuState, event: MenuEvent): MenuTransition | null {
  if (event.type === 'TRIGGER.CLICK') {
    return state.open ? { open: false, reason: 'trigger' } : { open: true, reason: 'trigger', initial: 'first' };
  }
  if (event.type === 'TRIGGER.OPEN')
    return state.open ? null : { open: true, reason: 'trigger', initial: event.initial };
  if (!state.open) return null;
  if (event.type === 'CONTENT.DISMISS') return { open: false, reason: event.reason };
  if (event.type === 'ITEM.RUN') return event.disabled || event.prevented ? null : { open: false, reason: 'item' };
  return null;
}

/**
 * Computes the props of every Menu part. Pure: no DOM, same result on the server and the client.
 *
 * @param state - The author's props and the tracked facts, with the resolved placement and the mounted items.
 * @param send - Receives the events of the handlers; pass them to {@link transitionMenu}.
 * @returns The props of the trigger and the content, and a function that returns the props of one item.
 */
export function getMenuProps(state: MenuState, send: (event: MenuEvent) => void): MenuParts {
  const { classes } = menuAnatomy;
  const ids = menuIds(state.id);
  const dataState = state.open ? 'open' : 'closed';
  const first = state.items?.[0]?.key;
  const activeKey = state.items?.some((item) => item.key === state.activeKey) ? state.activeKey : first;
  return {
    trigger: {
      class: classes.trigger,
      id: ids.trigger,
      type: 'button',
      'aria-haspopup': 'menu',
      'aria-expanded': state.open ? 'true' : 'false',
      'aria-controls': (state.mounted ?? state.open) ? ids.content : undefined,
      'data-state': dataState,
      onClick: (event) => {
        if (!event.defaultPrevented) send({ type: 'TRIGGER.CLICK', event });
      },
      onKeyDown: createMenuTriggerKeyDown(state, send),
    },
    content: {
      class: classes.content,
      id: ids.content,
      role: 'menu',
      tabIndex: -1,
      'aria-labelledby': state.named ? undefined : ids.trigger,
      'data-state': dataState,
      'data-side': state.side ?? 'bottom',
      'data-align': state.align ?? 'start',
      onKeyDown: createMenuContentKeyDown(state, send),
    },
    item: (entry: MenuItemEntry): MenuItemProps => ({
      class: classes.item,
      role: 'menuitem',
      tabIndex: entry.key === activeKey ? 0 : -1,
      'aria-disabled': entry.disabled ? 'true' : undefined,
      'data-disabled': entry.disabled ? '' : undefined,
      onClick: (event) => {
        if (!event.defaultPrevented)
          send({ type: 'ITEM.RUN', key: entry.key, disabled: entry.disabled === true, event });
      },
      onFocus: () => {
        send({ type: 'ITEM.FOCUS', key: entry.key });
      },
    }),
  };
}
