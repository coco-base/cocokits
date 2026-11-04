import { resolveNextIndex, resolveTabStop } from '@cocokits/cdk/roving-focus';
import { dataAttr } from '@cocokits/utils';
import { radioGroupAnatomy } from './radio-group.anatomy';
import type {
  RadioGroupEvent,
  RadioGroupItem,
  RadioGroupKeyBinding,
  RadioGroupParts,
  RadioGroupRadioFacts,
  RadioGroupRootProps,
  RadioGroupState,
  RadioGroupTransition,
} from './radio-group.types';

/**
 * The handled keys, as data. The meta keyboard table has one row per `row`. Home, End, PageUp and PageDown
 * are not handled; Space and Enter are native.
 */
export const radioGroupKeymap: readonly RadioGroupKeyBinding[] = [
  { keys: ['ArrowDown', 'ArrowRight'], row: 'ArrowDown / ArrowRight' },
  { keys: ['ArrowUp', 'ArrowLeft'], row: 'ArrowUp / ArrowLeft' },
];

/** A radio without a value can never be checked, so it is not a target of the keys or the tab stop. */
function isUnavailable(item: RadioGroupItem, state: RadioGroupState): boolean {
  return state.disabled === true || item.disabled === true || item.value === undefined;
}

/** The value of the radio that holds the single tab stop, or `undefined` when there is none. */
function tabStop(state: RadioGroupState): string | undefined {
  if (state.disabled === true) return undefined;
  const index = resolveTabStop(
    state.items.map((item) => ({ disabled: isUnavailable(item, state) })),
    state.value == null ? -1 : state.items.findIndex((item) => item.value === state.value),
  );
  return state.items[index]?.value;
}

/**
 * Computes what the adapter does after an event. Pure.
 *
 * A key move focuses an enabled target and activates it unless it is already checked.
 *
 * @param state - The group state.
 * @param event - The event the root key handler sent.
 * @returns The value to focus and the value to activate; empty when nothing changes.
 */
export function transitionRadioGroup(state: RadioGroupState, event: RadioGroupEvent): RadioGroupTransition {
  const target = state.items.find((item) => item.value === event.value);
  if (!target || isUnavailable(target, state)) return {};
  return event.value === state.value ? { focus: event.value } : { focus: event.value, activate: event.value };
}

function isHandledKey(event: KeyboardEvent): boolean {
  return (
    !event.defaultPrevented &&
    !event.isComposing &&
    !(event.altKey || event.ctrlKey || event.metaKey) &&
    radioGroupKeymap.some((binding) => binding.keys.includes(event.key))
  );
}

function onKeyDown(
  state: RadioGroupState,
  send: (event: RadioGroupEvent) => void,
): (event: KeyboardEvent, current: string | undefined) => void {
  return (event, current) => {
    if (state.disabled === true || current === undefined || !isHandledKey(event)) return;
    const from = state.items.findIndex((item) => item.value === current);
    if (from < 0) return;
    // Every handled arrow is ours, even one the orientation or the end of the list blocks: the browser
    // would move the native radio anyway and `orientation` and `loop` would not hold.
    event.preventDefault();
    const next = resolveNextIndex({
      key: event.key,
      count: state.items.length,
      current: from,
      isDisabled: (index) => {
        const item = state.items[index];
        return item === undefined || isUnavailable(item, state);
      },
      orientation: state.orientation ?? 'both',
      loop: state.loop !== false,
      dir: state.dir ?? 'ltr',
    });
    const target = next === null || next === from ? undefined : state.items[next]?.value;
    if (target !== undefined) send({ type: 'RADIO.NAVIGATE', value: target, event });
  };
}

function rootProps(state: RadioGroupState, send: (event: RadioGroupEvent) => void): RadioGroupRootProps {
  return {
    class: radioGroupAnatomy.classes.root,
    role: 'radiogroup',
    'aria-required': state.required === true ? 'true' : undefined,
    'aria-disabled': state.disabled === true ? 'true' : undefined,
    'aria-orientation': state.orientation,
    'data-disabled': dataAttr(state.disabled),
    'data-required': dataAttr(state.required),
    'data-orientation': state.orientation,
    onKeyDown: onKeyDown(state, send),
  };
}

/**
 * Computes the props of the root and the facts of each radio. Pure: no DOM, same result on the server and
 * the client. The key handler sends events; it computes nothing while the props are computed.
 *
 * @param state - The author's props and the tracked facts.
 * @param send - Receives the event of the key handler; pass it to {@link transitionRadioGroup}.
 * @returns The root props and a function per radio for its facts.
 */
export function getRadioGroupProps(state: RadioGroupState, send: (event: RadioGroupEvent) => void): RadioGroupParts {
  const stop = tabStop(state);
  return {
    root: rootProps(state, send),
    radio(item): RadioGroupRadioFacts {
      const disabled = state.disabled === true || item.disabled === true;
      const required = state.required === true || item.required === true;
      let tabIndex: 0 | -1 | undefined;
      if (state.mounted === true) tabIndex = item.value !== undefined && item.value === stop ? 0 : -1;
      return {
        checked: item.value !== undefined && item.value === state.value,
        name: state.name === '' ? undefined : state.name,
        disabled: disabled ? true : undefined,
        required: required ? true : undefined,
        form: item.form ?? state.form,
        tabIndex,
      };
    },
  };
}
