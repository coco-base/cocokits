import { menuIds } from './menu-ids';
import { getMenuItemProps } from './menu-item';
import { createMenuContentKeyDown, createMenuTriggerKeyDown } from './menu-keyboard';
import { getMenuItemContentParts } from './menu-parts';
import { getMenuSubTriggerProps } from './menu-sub';
import { menuAnatomy } from './menu.anatomy';
import type { MenuEvent, MenuParts, MenuState, MenuTransition } from './menu.types';

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
 * @returns The props of the trigger and the content, a function that returns the props of one item (plain,
 * checkbox or radio) or of a sub-trigger, and the props of the groups and of the parts inside an item. With
 * `state.sub` the content is the sub-content of a submenu.
 */
export function getMenuProps(state: MenuState, send: (event: MenuEvent) => void): MenuParts {
  const { classes } = menuAnatomy;
  const ids = menuIds(state.id);
  const triggerId = state.triggerId ?? ids.trigger;
  const dataState = state.open ? 'open' : 'closed';
  return {
    ...getMenuItemContentParts(state.id),
    trigger: {
      class: classes.trigger,
      id: triggerId,
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
      class: state.sub === true ? classes.subContent : classes.content,
      id: ids.content,
      role: 'menu',
      tabIndex: -1,
      'aria-labelledby': state.named ? undefined : triggerId,
      'data-state': dataState,
      'data-side': state.side ?? 'bottom',
      'data-align': state.align ?? 'start',
      onKeyDown: createMenuContentKeyDown(state, send),
    },
    item: (entry) => getMenuItemProps(state, entry, send),
    subTrigger: (entry, sub) => getMenuSubTriggerProps(state, entry, sub, send),
  };
}
