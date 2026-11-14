import { resolveNextIndex, type TypeaheadItem } from '@cocokits/cdk/roving-focus';
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

/** The key of the active item: the one asked for while it is mounted, else the first item. */
function activeKeyOf(state: MenuState): string | undefined {
  const all = items(state);
  return all.find((item) => item.key === state.activeKey)?.key ?? all[0]?.key;
}

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

/** Enter or Space presses the active item; a disabled one only holds the default. */
function press(state: MenuState, event: KeyboardEvent): KeyResult {
  const active = items(state).find((item) => item.key === activeKeyOf(state));
  if (!active || active.disabled) return { send: null, prevent: true };
  return { send: { type: 'ITEM.PRESS', key: active.key, event }, prevent: true };
}

/** One action per intent the content handles. `native` and `layer` rows belong to the browser and the layers. */
const contentActions: Partial<Record<MenuKeyBinding['intent'], KeyAction>> = {
  step: moved,
  edge: moved,
  typeahead,
  press,
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
 * character finds an item by its text, Enter and Space press the active item. Escape, Tab and Shift+Tab are
 * left to the dismissal stack and the focus guards. A key the menu does not handle is left alone, as is a
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
    const binding = find(['Menu', 'Menu item'], state, event);
    const action = binding ? contentActions[binding.intent] : isPrintable(event) ? typeahead : undefined;
    const result = action?.(state, event);
    if (!result) return;
    if (result.prevent) event.preventDefault();
    if (result.send) send(result.send);
  };
}
