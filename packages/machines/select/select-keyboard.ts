import { resolveNextIndex } from '@cocokits/cdk/roving-focus';
import { isSelectItemVisible, selectedIndex, toTypeaheadItems } from './select-values';
import type { SelectSearchKeyBinding } from './select-search.types';
import type { SelectEvent, SelectKeyBinding, SelectState } from './select.types';

/** How far PageUp and PageDown move the highlight. */
const PAGE_SIZE = 10;

/**
 * The handled keys, as data. The meta keyboard table has one row for each `row`. Vertical keys never flip
 * with the direction, so the keymap has no `dir`.
 */
export const selectKeymap: readonly SelectKeyBinding[] = [
  {
    keys: ['ArrowDown'],
    when: 'closed',
    alt: 'either',
    intent: 'open-selected',
    row: 'ArrowDown, Alt+ArrowDown, Enter, Space',
  },
  {
    keys: ['Enter', ' '],
    when: 'closed',
    alt: 'no',
    intent: 'open-selected',
    row: 'ArrowDown, Alt+ArrowDown, Enter, Space',
  },
  { keys: ['ArrowUp'], when: 'closed', alt: 'no', intent: 'open-first', row: 'ArrowUp' },
  { keys: ['Home', 'End'], when: 'both', alt: 'no', intent: 'edge', row: 'Home / End' },
  { keys: [], when: 'both', alt: 'no', intent: 'typeahead', row: 'Printable character' },
  // Only while a search is running; `find` skips it otherwise, so Space opens and chooses.
  { keys: [' '], when: 'both', alt: 'no', intent: 'typeahead', row: 'Space' },
  { keys: ['ArrowDown', 'ArrowUp'], when: 'open', alt: 'no', intent: 'step', row: 'ArrowDown / ArrowUp' },
  { keys: ['PageDown', 'PageUp'], when: 'open', alt: 'no', intent: 'page', row: 'PageDown / PageUp' },
  { keys: ['Enter', ' '], when: 'open', alt: 'no', intent: 'choose', row: 'Enter / Space' },
  { keys: ['ArrowUp'], when: 'open', alt: 'yes', intent: 'choose-close', row: 'Alt+ArrowUp' },
  { keys: ['Tab'], when: 'open', alt: 'no', intent: 'tab', row: 'Tab' },
  { keys: ['Escape'], when: 'open', alt: 'no', intent: 'escape', row: 'Escape' },
];

/**
 * The handled keys of the search input, as data. The meta keyboard table has one row with the context
 * `search input` for each `row`. The other keys, Home and End included, belong to the text field.
 */
export const selectSearchKeymap: readonly SelectSearchKeyBinding[] = [
  { keys: ['ArrowDown', 'ArrowUp'], intent: 'step', row: 'ArrowDown / ArrowUp' },
  { keys: ['Enter'], intent: 'choose', row: 'Enter' },
  { keys: ['Escape'], intent: 'escape', row: 'Escape' },
  { keys: ['Tab'], intent: 'tab', row: 'Tab' },
];

/** The facts the handlers need, with the field's facts already merged in. */
export interface SelectKeyFacts {
  /** Whether the Select reacts at all: not disabled and not read-only. */
  readonly interactive: boolean;
}

function isPrintable(event: KeyboardEvent): boolean {
  return event.key.length === 1 && !event.altKey;
}

/** Space belongs to a search that is running; it neither opens nor chooses. */
const isTypingSpace = (state: SelectState<unknown>, event: KeyboardEvent): boolean =>
  event.key === ' ' && state.typeahead?.isActive() === true;

function find(state: SelectState<unknown>, event: KeyboardEvent): SelectKeyBinding | undefined {
  const phase = state.open ? 'open' : 'closed';
  const typingSpace = isTypingSpace(state, event);
  return selectKeymap.find(
    (binding) =>
      (binding.intent === 'typeahead' && binding.keys.includes(' ')) === typingSpace &&
      (binding.when === 'both' || binding.when === phase) &&
      binding.keys.includes(event.key) &&
      (binding.alt === 'either' || (binding.alt === 'yes') === event.altKey),
  );
}

/** The key of the option highlight moves to for the key, or `undefined` when the key cannot move it. */
function moveTarget(state: SelectState<unknown>, key: string): string | undefined {
  const current = state.items.findIndex((item) => item.key === state.highlighted);
  const next = resolveNextIndex({
    key,
    count: state.items.length,
    current,
    isDisabled: (index) => {
      const item = state.items[index];
      return item === undefined || item.disabled === true || !isSelectItemVisible(state, item);
    },
    orientation: 'vertical',
    loop: false,
    dir: 'ltr',
    pageSize: PAGE_SIZE,
  });
  return next === null ? undefined : state.items[next]?.key;
}

/** What a key stands for: the event to send (if any) and whether the key's default action must be stopped. */
interface KeyResult {
  readonly send: SelectEvent | null;
  readonly prevent: boolean;
}

function moved(state: SelectState<unknown>, event: KeyboardEvent): KeyResult {
  const key = moveTarget(state, event.key);
  return {
    send: key === undefined || key === state.highlighted ? null : { type: 'LIST.MOVE', key, event },
    prevent: true,
  };
}

/**
 * Finds the option a typed character moves to: the next one whose text starts with the buffer, starting after
 * the highlighted option while open and after the selected one while closed. It adds the character to the
 * buffer of `state.typeahead`. An adapter that mounts the options only when the list opens calls it for the
 * first character, once they are registered.
 *
 * @param state - The Select state, with its items.
 * @param char - `KeyboardEvent.key` of a printable key.
 * @returns The key of the option, or `null` when nothing matches or there is no buffer.
 */
export function resolveSelectTypeahead<T>(state: SelectState<T>, char: string): string | null {
  const current = state.open ? state.items.findIndex((item) => item.key === state.highlighted) : selectedIndex(state);
  const index = state.typeahead?.match(char, toTypeaheadItems(state), current) ?? null;
  return (index === null ? undefined : state.items[index]?.key) ?? null;
}

function typeahead(state: SelectState<unknown>, event: KeyboardEvent): KeyResult | null {
  const key = resolveSelectTypeahead(state, event.key);
  if (key === null) return event.key === ' ' ? { send: null, prevent: true } : null;
  return {
    send: state.open ? { type: 'LIST.MOVE', key, event } : { type: 'TRIGGER.OPEN', initial: { key }, event },
    prevent: true,
  };
}

/**
 * Builds the `keydown` handler of the search input. ArrowDown and ArrowUp move the highlight through the options
 * the query shows, Enter chooses the highlighted option, Escape closes and Tab closes as it does on the trigger
 * (the browser moves focus). Any other key, a vetoed, composing or modified one included, belongs to the text field.
 *
 * @param state - The Select state, with its query.
 * @param send - Receives the event the key stands for.
 * @returns The handler.
 */
export function createSelectSearchKeyDown(
  state: SelectState<unknown>,
  send: (event: SelectEvent) => void,
): (event: KeyboardEvent) => void {
  return (event) => {
    if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.shiftKey && event.key !== 'Tab') return;
    const binding = selectSearchKeymap.find((candidate) => candidate.keys.includes(event.key));
    if (!binding) return;
    switch (binding.intent) {
      case 'step': {
        event.preventDefault();
        const key = moveTarget(state, event.key);
        if (key !== undefined && key !== state.highlighted) send({ type: 'LIST.MOVE', key, event });
        return;
      }
      case 'choose':
        event.preventDefault();
        send({ type: 'LIST.CHOOSE', event });
        return;
      case 'escape':
        event.preventDefault();
        send({ type: 'LIST.DISMISS', reason: 'escape', event });
        return;
      case 'tab':
        send({ type: 'LIST.DISMISS', reason: 'blur', event });
    }
  };
}

type KeyAction = (state: SelectState<unknown>, event: KeyboardEvent) => KeyResult | null;

/** One action per intent of the keymap. Tab is left to the browser (`prevent: false`). */
const actions: Record<SelectKeyBinding['intent'], KeyAction> = {
  'open-selected': (_state, event) => ({ send: { type: 'TRIGGER.OPEN', initial: 'selected', event }, prevent: true }),
  'open-first': (_state, event) => ({ send: { type: 'TRIGGER.OPEN', initial: 'first', event }, prevent: true }),
  edge: (state, event) =>
    state.open
      ? moved(state, event)
      : { send: { type: 'TRIGGER.OPEN', initial: event.key === 'Home' ? 'first' : 'last', event }, prevent: true },
  step: moved,
  page: moved,
  choose: (_state, event) => ({ send: { type: 'LIST.CHOOSE', event }, prevent: true }),
  'choose-close': (_state, event) => ({ send: { type: 'LIST.CHOOSE_AND_CLOSE', event }, prevent: true }),
  tab: (_state, event) => ({ send: { type: 'LIST.DISMISS', reason: 'blur', event }, prevent: false }),
  escape: (_state, event) => ({ send: { type: 'LIST.DISMISS', reason: 'escape', event }, prevent: true }),
  typeahead,
};

function toEvent(state: SelectState<unknown>, event: KeyboardEvent): KeyResult | null {
  const binding = find(state, event);
  if (binding) return actions[binding.intent](state, event);
  return isPrintable(event) ? typeahead(state, event) : null;
}

/**
 * Builds the `keydown` handler of the trigger. A key the Select does not handle is left alone, as is a
 * vetoed, composing, Ctrl or Meta key, and every key while the Select is disabled or read-only.
 *
 * @param state - The Select state.
 * @param facts - Whether the Select reacts.
 * @param send - Receives the event the key stands for.
 * @returns The handler.
 */
export function createSelectKeyDown(
  state: SelectState<unknown>,
  facts: SelectKeyFacts,
  send: (event: SelectEvent) => void,
): (event: KeyboardEvent) => void {
  return (event) => {
    if (!facts.interactive || event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey) return;
    if (event.shiftKey && event.key.length > 1 && event.key !== 'Tab') return;
    const result = toEvent(state, event);
    if (!result) return;
    if (result.prevent) event.preventDefault();
    if (result.send) send(result.send);
  };
}
