import { isSameValue, isSelectEmpty, isValueSelected, selectedValues } from './select-values';
import type {
  SelectEvent,
  SelectInitialHighlight,
  SelectItem,
  SelectOpenReason,
  SelectState,
  SelectTransition,
} from './select.types';

const interactive = <T>(state: SelectState<T>): boolean => state.disabled !== true && state.readOnly !== true;

/**
 * The key of the option the highlight starts on: the first or last enabled option, the selected one (else the
 * first enabled) or a given key. It reads the items and the value, never the highlight, so an adapter can
 * use it to start the highlight when the open model is written from outside.
 *
 * @param state - The Select state.
 * @param initial - Where the highlight starts.
 * @returns The key, or `null` when no option is enabled.
 */
export function resolveSelectHighlight<T>(state: SelectState<T>, initial: SelectInitialHighlight): string | null {
  if (typeof initial === 'object') return initial.key;
  const enabled = state.items.filter((item) => item.disabled !== true);
  if (initial === 'first') return enabled[0]?.key ?? null;
  if (initial === 'last') return enabled.at(-1)?.key ?? null;
  return (enabled.find((item) => isValueSelected(state, item.value)) ?? enabled[0])?.key ?? null;
}

function openList<T>(state: SelectState<T>, initial: SelectInitialHighlight): SelectTransition<T> | null {
  if (state.open || !interactive(state)) return null;
  return {
    open: { open: true, reason: 'trigger' },
    highlight: resolveSelectHighlight(state, initial),
    reveal: true,
  };
}

const closedBy = (reason: SelectOpenReason) => ({ open: { open: false, reason }, highlight: null }) as const;

/** Whether choosing the option clears a single Select: its value is `null` or `undefined` and nullable options are not selectable. */
function clearsSelection<T>(state: SelectState<T>, item: SelectItem<T>): boolean {
  return (item.value === undefined || item.value === null) && state.canSelectNullableOptions !== true;
}

/**
 * Chooses one option: a single Select sets the value and closes; a multiple one toggles the value and closes
 * only when asked. A close reports `reason`.
 */
function choose<T>(
  state: SelectState<T>,
  item: SelectItem<T> | undefined,
  closeAfter: boolean,
  reason: SelectOpenReason = 'select',
): SelectTransition<T> | null {
  if (!item || item.disabled === true || !state.open) return null;
  if (state.multiple) {
    const current = selectedValues(state);
    const toggled = isValueSelected(state, item.value)
      ? current.filter((selected) => !isSameValue(state, selected, item.value))
      : [...current, item.value];
    const value = state.orderValues ? state.orderValues(toggled) : toggled;
    return closeAfter ? { value, ...closedBy(reason) } : { value };
  }
  const clears = clearsSelection(state, item);
  if (clears ? isSelectEmpty(state) : isValueSelected(state, item.value)) return closedBy(reason);
  return { value: clears ? null : item.value, ...closedBy(reason) };
}

function chooseHighlighted<T>(state: SelectState<T>, closeAfter: boolean): SelectTransition<T> | null {
  const item = findItem(state, state.highlighted);
  if (item) return choose(state, item, closeAfter);
  return closeAfter && state.open ? closedBy('blur') : null;
}

/** A dismissal: focus leaving the trigger first commits the highlighted enabled option of a single Select. */
function dismiss<T>(
  state: SelectState<T>,
  event: Extract<SelectEvent, { type: 'LIST.DISMISS' }>,
): SelectTransition<T> | null {
  if (!state.open) return null;
  const focusLeft = event.reason === 'blur' || (event.reason === 'outside-press' && event.focusLeft === true);
  if (focusLeft && state.multiple !== true) {
    const item = findItem(state, state.highlighted);
    if (item && item.disabled !== true) return choose(state, item, true, event.reason);
  }
  return closedBy(event.reason);
}

function findItem<T>(state: SelectState<T>, key: string | undefined): SelectItem<T> | undefined {
  return state.items.find((candidate) => candidate.key === key);
}

function pointerMove<T>(state: SelectState<T>, key: string): SelectTransition<T> | null {
  const item = findItem(state, key);
  return state.open && item !== undefined && item.disabled !== true && key !== state.highlighted
    ? { highlight: key }
    : null;
}

/**
 * Decides what the adapter does after an event: the open change, the highlighted option, whether to scroll
 * it into view and the new value. Pure: it reads the state and nothing else.
 *
 * - A click or a key opens the list on the selected option (else the first enabled one); a disabled or
 *   read-only Select never opens.
 * - A single Select closes when an option is chosen (reason `select`); a multiple one toggles the value
 *   and stays open.
 * - A disabled option is never highlighted by the pointer and never chosen.
 * - Focus leaving the trigger (`blur`, or an outside press that moved focus) chooses the highlighted enabled
 *   option of a single Select, then closes with the reason of the dismissal; Escape never chooses.
 * - An option whose value is `null` or `undefined` clears a single Select (value `null`) unless
 *   `canSelectNullableOptions`.
 *
 * @param state - The Select state.
 * @param event - The event a handler sent.
 * @returns What to do, or `null` when nothing changes.
 */
export function transitionSelect<T>(state: SelectState<T>, event: SelectEvent): SelectTransition<T> | null {
  switch (event.type) {
    case 'TRIGGER.CLICK':
      if (state.open) return { open: { open: false, reason: 'trigger' }, highlight: null };
      return openList(state, 'selected');
    case 'TRIGGER.OPEN':
      return openList(state, event.initial);
    case 'LIST.MOVE':
      return state.open ? { highlight: event.key, reveal: true } : null;
    case 'OPTION.POINTER_MOVE':
      return pointerMove(state, event.key);
    case 'OPTION.CLICK':
      return choose(state, findItem(state, event.key), false);
    case 'LIST.CHOOSE':
      return chooseHighlighted(state, false);
    case 'LIST.CHOOSE_AND_CLOSE':
      return chooseHighlighted(state, true);
    case 'LIST.DISMISS':
      return dismiss(state, event);
  }
}
