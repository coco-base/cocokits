import { dataAttr } from '@cocokits/utils';
import { menuIds } from './menu-ids';
import { createMenuSubTriggerKeyDown, resolveMenuActiveKey } from './menu-keyboard';
import { menuAnatomy } from './menu.anatomy';
import type { MenuEvent, MenuItemEntry, MenuState } from './menu.types';
import type {
  MenuSubPlacement,
  MenuSubState,
  MenuSubTransition,
  MenuSubTransitionState,
  MenuSubTriggerProps,
} from './menu-sub.types';

/** The wait in milliseconds before a pointer on the sub-trigger opens the submenu, so a pointer that only passes does not. */
export const MENU_SUB_OPEN_DELAY_MS = 100;

/**
 * Derives the ids of a submenu.
 *
 * @param id - The id of the submenu, from the adapter.
 * @param triggerId - The id the sub-trigger renders, when the author sets one.
 * @returns The sub-trigger and sub-content ids.
 */
export function menuSubIds(id: string, triggerId?: string): { readonly trigger: string; readonly content: string } {
  const ids = menuIds(id);
  return { trigger: triggerId ?? ids.trigger, content: ids.content };
}

/**
 * Where the sub-content goes: its top-start corner at the bottom-end corner of the sub-trigger, then the menu gap
 * (`--side-offset`). With no room below it flips to the start side of the sub-trigger, then above it.
 *
 * @param anchorWidth - The width of the sub-trigger in px.
 * @returns The side, the alignment, the offset along the edge and the fallback sides.
 */
export function getMenuSubPlacement(anchorWidth: number): MenuSubPlacement {
  return { side: 'bottom', align: 'start', alignOffset: anchorWidth, fallbackSides: ['start', 'top'] };
}

const canOpen = (state: MenuSubTransitionState): boolean => !state.open && state.disabled !== true;

/** Escape returns focus to the sub-trigger; an outside press leaves it where it went. */
function dismissed(reason: 'escape' | 'outside-press'): MenuSubTransition {
  return reason === 'escape'
    ? { open: false, reason: 'escape', focus: 'trigger' }
    : { open: false, reason: 'outside-press' };
}

/**
 * Decides the open change of a submenu an event asks for. Pure.
 *
 * - A click or a key (ArrowRight, Enter, Space) on the sub-trigger opens it; a key focuses an item.
 * - The pointer on the sub-trigger opens it after a wait; the pointer moving to another item of the parent
 *   closes it.
 * - ArrowLeft in it and Escape close it and return focus to the sub-trigger; an outside press closes it.
 * - A disabled sub-trigger never opens.
 *
 * @param state - The submenu state, with whether its sub-trigger is disabled.
 * @param event - The event a handler or the layer stack sent.
 * @returns The requested state and its reason, or `null` when nothing would change (also for events that are
 * not about a submenu).
 */
export function transitionMenuSub(state: MenuSubTransitionState, event: MenuEvent): MenuSubTransition | null {
  switch (event.type) {
    case 'SUB.TRIGGER.CLICK':
      return canOpen(state) ? { open: true, reason: 'trigger' } : null;
    case 'SUB.TRIGGER.OPEN':
      return canOpen(state) ? { open: true, reason: 'key', initial: event.initial } : null;
    case 'SUB.TRIGGER.POINTER_MOVE':
      return canOpen(state) ? { open: true, reason: 'pointer', delay: MENU_SUB_OPEN_DELAY_MS } : null;
    case 'SUB.PARENT.POINTER_MOVE':
      return state.open ? { open: false, reason: 'pointer' } : null;
    case 'SUB.CLOSE':
      return state.open ? { open: false, reason: 'key', focus: 'trigger' } : null;
    case 'SUB.DISMISS':
      return state.open ? dismissed(event.reason) : null;
    default:
      return null;
  }
}

/**
 * Computes the props of a sub-trigger: an item of the parent menu that opens a submenu. Pure. A press on it never
 * runs it like an item; it only opens the submenu.
 *
 * @param parent - The state of the menu the sub-trigger is an item of.
 * @param entry - The sub-trigger's entry in the parent's items.
 * @param sub - The submenu state.
 * @param send - Receives the events of the handlers: `SUB.*` for `transitionMenuSub`, `ITEM.FOCUS` for the parent.
 * @returns The sub-trigger props.
 */
export function getMenuSubTriggerProps(
  parent: MenuState,
  entry: MenuItemEntry,
  sub: MenuSubState,
  send: (event: MenuEvent) => void,
): MenuSubTriggerProps {
  const ids = menuSubIds(sub.id, sub.triggerId);
  const disabled = entry.disabled === true;
  return {
    class: menuAnatomy.classes.subTrigger,
    id: ids.trigger,
    role: 'menuitem',
    tabIndex: entry.key === resolveMenuActiveKey(parent) ? 0 : -1,
    'aria-haspopup': 'menu',
    'aria-expanded': sub.open ? 'true' : 'false',
    'aria-controls': (sub.mounted ?? sub.open) ? ids.content : undefined,
    'aria-disabled': disabled ? 'true' : undefined,
    'data-state': sub.open ? 'open' : 'closed',
    'data-disabled': dataAttr(disabled),
    'data-highlighted': dataAttr(parent.open && entry.key === resolveMenuActiveKey(parent)),
    onClick: (event) => {
      if (!event.defaultPrevented) send({ type: 'SUB.TRIGGER.CLICK', event });
    },
    onPointerMove: (event) => {
      send({ type: 'SUB.TRIGGER.POINTER_MOVE', event });
    },
    onFocus: () => {
      send({ type: 'ITEM.FOCUS', key: entry.key });
    },
    onKeyDown: createMenuSubTriggerKeyDown(parent, entry, send),
  };
}
