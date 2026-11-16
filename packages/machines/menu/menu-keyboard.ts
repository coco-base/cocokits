import { resolveNextIndex, type TypeaheadItem } from '@cocokits/cdk/roving-focus';
import type { Direction } from '@cocokits/shared';
import type { MenuEvent, MenuItemEntry, MenuKeyBinding, MenuState } from './menu.types';

/**
 * The handled keys, as data. The meta keyboard table has one row for each `row` and `context`. Vertical keys
 * never flip with the direction, so the keymap has no `dir`.
 */
export const menuKeymap: readonly MenuKeyBinding[] = [
  { keys: ['Enter', ' '], shift: 'either', context: 'Trigger', intent: 'native', row: 'Enter, Space' },
  { keys: ['ArrowDown'], shift: 'no', context: 'Trigger', intent: 'open-first', row: 'ArrowDown' },
  { keys: ['ArrowUp'], shift: 'no', context: 'Trigger', intent: 'open-last', row: 'ArrowUp' },
  { keys: ['ArrowDown', 'ArrowUp'], shift: 'no', context: 'Menu', intent: 'step', row: 'ArrowDown, ArrowUp' },
  { keys: ['Home', 'End'], shift: 'no', context: 'Menu', intent: 'edge', row: 'Home, End' },
  { keys: [], shift: 'either', context: 'Menu', intent: 'typeahead', row: 'Printable character' },
  // Only while a search is running; `find` skips it otherwise, so Space presses the item.
  { keys: [' '], shift: 'either', context: 'Menu', intent: 'typeahead', row: 'Printable character' },
  { keys: ['Enter', ' '], shift: 'no', context: 'Menu item', intent: 'press', row: 'Enter, Space' },
  { keys: ['Enter'], shift: 'no', context: 'Menu checkbox or radio item', intent: 'press', row: 'Enter' },
  { keys: [' '], shift: 'no', context: 'Menu checkbox or radio item', intent: 'check', row: 'Space' },
  {
    keys: ['ArrowRight', 'Enter', ' '],
    shift: 'no',
    context: 'Sub-trigger',
    intent: 'open-sub',
    row: 'ArrowRight, Enter, Space',
  },
  { keys: ['ArrowLeft'], shift: 'no', context: 'Submenu', intent: 'close-sub', row: 'ArrowLeft' },
  { keys: ['Escape'], shift: 'no', context: 'Submenu', intent: 'layer', row: 'Escape' },
  { keys: ['Escape'], shift: 'no', context: 'Menu', intent: 'layer', row: 'Escape' },
  { keys: ['Tab'], shift: 'no', context: 'Menu', intent: 'layer', row: 'Tab' },
  { keys: ['Tab'], shift: 'yes', context: 'Menu', intent: 'layer', row: 'Shift+Tab' },
];

/** What a key stands for: the event to send (if any) and whether the key's default action must be stopped. */
interface KeyResult {
  readonly send: MenuEvent | null;
  readonly prevent: boolean;
}

type KeyAction = (state: MenuState, event: KeyboardEvent) => KeyResult | null;

const items = (state: MenuState): readonly MenuItemEntry[] => state.items ?? [];

/**
 * The key of the active item: the one asked for while it is mounted, else the first item.
 *
 * @param state - The menu state, with its items.
 * @returns The key, or `undefined` while the menu has no item.
 */
export function resolveMenuActiveKey(state: MenuState): string | undefined {
  const all = items(state);
  return all.find((item) => item.key === state.activeKey)?.key ?? all[0]?.key;
}

const activeKeyOf = resolveMenuActiveKey;

/** The key that opens a submenu from its trigger: ArrowRight, ArrowLeft in rtl. The key that closes it is the other one. */
const openKey = (dir: Direction | undefined): 'ArrowRight' | 'ArrowLeft' =>
  dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
const closeKey = (dir: Direction | undefined): 'ArrowRight' | 'ArrowLeft' =>
  dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';

const shouldIgnore = (event: KeyboardEvent): boolean =>
  event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey;

const isPrintable = (event: KeyboardEvent): boolean => event.key.length === 1;

/** Space belongs to a search that is running; it does not press the item. */
const isTypingSpace = (state: MenuState, event: KeyboardEvent): boolean =>
  event.key === ' ' && state.typeahead?.isActive() === true;

function find(
  contexts: readonly MenuKeyBinding['context'][],
  state: MenuState,
  event: KeyboardEvent,
): MenuKeyBinding | undefined {
  const typingSpace = isTypingSpace(state, event);
  return menuKeymap.find(
    (binding) =>
      contexts.includes(binding.context) &&
      (binding.intent === 'typeahead' && binding.keys.includes(' ')) === typingSpace &&
      binding.keys.includes(event.key) &&
      (binding.shift === 'either' || (binding.shift === 'yes') === event.shiftKey),
  );
}

/** Every item is handed to the roving helpers as enabled: a disabled item stays reachable. */
function toRovingItems(state: MenuState): TypeaheadItem[] {
  return items(state).map((item) => ({ disabled: false, text: item.text }));
}

function moved(state: MenuState, event: KeyboardEvent): KeyResult {
  const all = items(state);
  const active = activeKeyOf(state);
  const next = resolveNextIndex({
    key: event.key,
    count: all.length,
    current: all.findIndex((item) => item.key === active),
    isDisabled: () => false,
    orientation: 'vertical',
    loop: true,
  });
  const key = next === null ? undefined : all[next]?.key;
  return { send: key === undefined || key === active ? null : { type: 'CONTENT.MOVE', key, event }, prevent: true };
}

function typeahead(state: MenuState, event: KeyboardEvent): KeyResult | null {
  const all = items(state);
  const active = activeKeyOf(state);
  const index = state.typeahead?.match(
    event.key,
    toRovingItems(state),
    all.findIndex((item) => item.key === active),
  );
  const key = index === null || index === undefined ? undefined : all[index]?.key;
  if (key === undefined) return event.key === ' ' && state.typeahead ? { send: null, prevent: true } : null;
  return { send: { type: 'CONTENT.MOVE', key, event }, prevent: true };
}

/** One action per intent the content handles. `native` and `layer` rows belong to the browser and the layers. */
const contentActions: Partial<Record<MenuKeyBinding['intent'], KeyAction>> = {
  step: moved,
  edge: moved,
  typeahead,
};

/**
 * Builds the `keydown` handler of the trigger: ArrowDown opens the menu on the first item and ArrowUp on the
 * last. Enter and Space are the browser's click. A key the menu does not handle is left alone, as is a vetoed,
 * composing or modified key and every key while the menu is open.
 *
 * @param state - The menu state.
 * @param send - Receives the event the key stands for.
 * @returns The handler.
 */
export function createMenuTriggerKeyDown(
  state: MenuState,
  send: (event: MenuEvent) => void,
): (event: KeyboardEvent) => void {
  return (event) => {
    if (state.open || shouldIgnore(event)) return;
    const binding = find(['Trigger'], state, event);
    if (binding?.intent !== 'open-first' && binding?.intent !== 'open-last') return;
    event.preventDefault();
    send({ type: 'TRIGGER.OPEN', initial: binding.intent === 'open-first' ? 'first' : 'last', event });
  };
}

/**
 * Builds the `keydown` handler of the content: the arrows, Home and End move between items, a printable
 * character finds an item by its text. In a submenu (`state.sub`), ArrowLeft (ArrowRight in rtl) sends
 * `SUB.CLOSE`. A key on the content itself never presses an item. Escape, Tab and Shift+Tab are
 * left to the dismissal stack and the focus guards (Escape closes only the topmost layer, so only the submenu). A key the menu does not handle is left alone, as is a
 * vetoed, composing or modified key.
 *
 * @param state - The menu state, with its items and the active one.
 * @param send - Receives the event the key stands for.
 * @returns The handler.
 */
export function createMenuContentKeyDown(
  state: MenuState,
  send: (event: MenuEvent) => void,
): (event: KeyboardEvent) => void {
  return (event) => {
    if (shouldIgnore(event)) return;
    if (event.shiftKey && event.key.length > 1) return;
    if (state.sub === true && !event.shiftKey && event.key === closeKey(state.dir)) {
      event.preventDefault();
      send({ type: 'SUB.CLOSE', event });
      return;
    }
    const binding = find(['Menu'], state, event);
    const action = binding
      ? contentActions[binding.intent]
      : isPrintable(event) && event.key !== ' '
        ? typeahead
        : undefined;
    const result = action?.(state, event);
    if (!result) return;
    if (result.prevent) event.preventDefault();
    if (result.send) send(result.send);
  };
}

/**
 * Builds the `keydown` handler of one item: Enter and Space press it, and a disabled item only holds the
 * default action. On a checkbox or radio item Enter presses it (the menu closes) and Space sends `ITEM.CHECK`
 * (the menu stays open). Space belongs to the content's typeahead while a search is running. A vetoed,
 * composing or modified key, and Shift with Enter, are left alone.
 *
 * @param state - The menu state, with its typeahead.
 * @param entry - The item the handler is for.
 * @param send - Receives the event the key stands for.
 * @returns The handler.
 */
export function createMenuItemKeyDown(
  state: MenuState,
  entry: MenuItemEntry,
  send: (event: MenuEvent) => void,
): (event: KeyboardEvent) => void {
  return (event) => {
    if (shouldIgnore(event) || event.shiftKey) return;
    if (event.key !== 'Enter' && (event.key !== ' ' || isTypingSpace(state, event))) return;
    event.preventDefault();
    if (entry.disabled === true) return;
    const checkable = entry.kind === 'checkbox' || entry.kind === 'radio';
    send(
      event.key === ' ' && checkable
        ? { type: 'ITEM.CHECK', key: entry.key, event }
        : { type: 'ITEM.PRESS', key: entry.key, event },
    );
  };
}

/**
 * Builds the `keydown` handler of a sub-trigger: ArrowRight (ArrowLeft in rtl), Enter and Space open the
 * submenu on its first item. A disabled sub-trigger only holds the default action. Space belongs to the content's
 * typeahead while a search is running. A vetoed, composing, modified or Shift key is left alone.
 *
 * @param state - The state of the menu the sub-trigger is an item of.
 * @param entry - The sub-trigger's entry.
 * @param send - Receives `SUB.TRIGGER.OPEN`.
 * @returns The handler.
 */
export function createMenuSubTriggerKeyDown(
  state: MenuState,
  entry: MenuItemEntry,
  send: (event: MenuEvent) => void,
): (event: KeyboardEvent) => void {
  return (event) => {
    if (shouldIgnore(event) || event.shiftKey) return;
    const opens =
      event.key === 'Enter' || event.key === openKey(state.dir) || (event.key === ' ' && !isTypingSpace(state, event));
    if (!opens) return;
    event.preventDefault();
    if (entry.disabled !== true) send({ type: 'SUB.TRIGGER.OPEN', initial: 'first', event });
  };
}
