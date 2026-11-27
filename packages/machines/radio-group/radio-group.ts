import { resolveNextIndex, resolveTabStop } from '@cocokits/cdk/roving-focus';
import { dataAttr } from '@cocokits/utils';
import { getFormFieldControlProps, groupLabelledBy, type FormFieldControlContext } from '../form-field';
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

/**
 * The value, not the registered radios, says whether the group is empty: an adapter may register the radios
 * after the server render, and a required group that has a value must not render invalid on the server.
 */
const isEmpty = (state: RadioGroupState): boolean =>
  state.value === undefined || state.value === null || state.value === '';

/** The group is invalid: the `invalid` fact, or required with no value. */
function isInvalid(state: RadioGroupState): boolean {
  return state.invalid === true || (state.required === true && isEmpty(state));
}

/**
 * Whether the invalid state shows: the group is invalid (the `invalid` fact, or required with no value)
 * and the user left it or tried to submit. `aria-invalid` and `data-invalid` both use it, so they cannot disagree.
 *
 * @param state - The group state.
 * @returns `true` while the invalid state should be shown.
 */
export function isRadioGroupInvalidShown(state: RadioGroupState): boolean {
  return isInvalid(state) && (state.touched === true || state.submitted === true);
}

function rootProps(
  state: RadioGroupState,
  send: (event: RadioGroupEvent) => void,
  field: FormFieldControlContext | undefined,
  control: { readonly id?: string | undefined; readonly 'aria-describedby'?: string | undefined },
): RadioGroupRootProps {
  return {
    class: radioGroupAnatomy.classes.root,
    role: 'radiogroup',
    id: control.id,
    'aria-label': state.ariaLabel === '' ? undefined : state.ariaLabel,
    'aria-labelledby': groupLabelledBy(state, field),
    'aria-describedby': control['aria-describedby'],
    'aria-required': state.required === true ? 'true' : undefined,
    'aria-disabled': state.disabled === true ? 'true' : undefined,
    'aria-invalid': isRadioGroupInvalidShown(state) ? 'true' : undefined,
    'aria-orientation': state.orientation,
    'data-disabled': dataAttr(state.disabled),
    'data-required': dataAttr(state.required),
    'data-invalid': dataAttr(isRadioGroupInvalidShown(state)),
    'data-orientation': state.orientation,
    onKeyDown: onKeyDown(state, send),
  };
}

/**
 * Computes the props of the root, the facts of each radio and the state the group reports to its field. Pure:
 * no DOM, same result on the server and the client. The key handler sends events; it computes nothing while the
 * props are computed.
 *
 * Inside a FormField the group is the labelled element of the field: the Label names it through
 * `aria-labelledby` unless the author named it, the hints and errors describe it, and the disabled, required and
 * invalid facts of the field reach it by OR. It reports `group`, so the Label renders no `for`.
 *
 * @param state - The author's props and the tracked facts.
 * @param send - Receives the event of the key handler; pass it to {@link transitionRadioGroup}.
 * @param field - What the enclosing FormField gives the group; leave it out outside a field.
 * @returns The root props, a function per radio for its facts, and the control state.
 */
export function getRadioGroupProps(
  state: RadioGroupState,
  send: (event: RadioGroupEvent) => void,
  field?: FormFieldControlContext,
): RadioGroupParts {
  const { root, control } = getFormFieldControlProps(
    {
      id: state.id,
      ariaDescribedBy: state.ariaDescribedBy,
      disabled: state.disabled,
      required: state.required,
      invalid: state.invalid,
      touched: state.touched,
      submitted: state.submitted,
      filled: !isEmpty(state),
    },
    field,
  );
  // The facts of the field join the group's own, so the radios, the tab stop and the keys follow them.
  const resolved: RadioGroupState = {
    ...state,
    disabled: control.disabled,
    required: control.required,
    invalid: control.invalid,
  };
  const stop = tabStop(resolved);
  return {
    root: rootProps(resolved, send, field, root),
    radio(item): RadioGroupRadioFacts {
      const disabled = resolved.disabled === true || item.disabled === true;
      const required = resolved.required === true || item.required === true;
      let tabIndex: 0 | -1 | undefined;
      if (resolved.mounted === true) tabIndex = item.value !== undefined && item.value === stop ? 0 : -1;
      return {
        checked: item.value !== undefined && item.value === resolved.value,
        name: resolved.name === '' ? undefined : resolved.name,
        disabled: disabled ? true : undefined,
        required: required ? true : undefined,
        form: item.form ?? resolved.form,
        tabIndex,
      };
    },
    control: { ...control, invalid: isInvalid(resolved), group: true },
  };
}
