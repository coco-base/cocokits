<script setup lang="ts" generic="T, M extends boolean = false">
import {
  computed,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  useAttrs,
  useId,
  watch,
  type FunctionalComponent,
  type VNode,
} from 'vue';
import { deepActiveElement } from '@cocokits/cdk/focus';
import { trackLabelActivation, type LabelActivation } from '@cocokits/cdk/form-control';
import { createTypeahead } from '@cocokits/cdk/roving-focus';
import { formFieldStateAttrs } from '@cocokits/machines/form-field';
import {
  getSelectPreviewValues,
  getSelectProps,
  getSelectValueText,
  isSelectEmpty,
  selectAnatomy,
  transitionSelect,
  valueToFormString,
  type SelectEvent,
  type SelectState,
} from '@cocokits/machines/select';
import { hasAccessibleName, visuallyHiddenStyle } from '@cocokits/utils';
import {
  isDevelopment,
  Primitive,
  provideDirection,
  useDirection,
  useFormParticipation,
  useThemeAttrs,
} from '@cocokits/vue-core';
import { useFormFieldContext } from '../internal/form-field-context';
import { liveElementRef } from '../internal/live-element';
import { omit } from '../internal/record';
import { useFieldControl } from '../internal/use-field-control';
import {
  provideSelect,
  type SelectItemRegistration,
  type SelectTriggerAria,
  type SelectTriggerHandlers,
} from './select.context';
import type { SelectRootEmits, SelectRootProps, SelectValueOf } from './select.types';
import { useSelectHighlight } from './use-select-highlight';
import { useSelectModel } from './use-select-model';
import { useSelectRegistry } from './use-select-registry';

defineOptions({ name: 'CckSelectRoot', inheritAttrs: false });

// A Boolean prop that is absent would be `false`; `undefined` lets the field's and the fieldset's facts decide.
const props = withDefaults(defineProps<SelectRootProps<T, M>>(), {
  modelValue: undefined,
  defaultValue: undefined,
  open: undefined,
  defaultOpen: false,
  items: undefined,
  itemToStringLabel: undefined,
  itemToStringValue: undefined,
  by: undefined,
  autocomplete: undefined,
  nullableValue: '',
  disabled: undefined,
  readonly: undefined,
  required: undefined,
  invalid: undefined,
  name: undefined,
  form: undefined,
  dir: undefined,
  asChild: false,
});
defineEmits<SelectRootEmits<T, M>>();
defineSlots<{
  /**
   * The trigger and the list. The slot gives you the value and the open state.
   *
   * The slot is always rendered. Use the fields only when you need the value or the open state in the template.
   *
   * @example
   * <SelectRoot v-model="dish" #default="{ open }">
   *   <SelectTrigger aria-label="Dish">
   *     <SelectValue placeholder="Choose a dish" />
   *     <SelectIcon />
   *   </SelectTrigger>
   *   <SelectContent>...</SelectContent>
   *   <p>The list is {{ open ? 'open' : 'closed' }}.</p>
   * </SelectRoot>
   */
  default?(props: {
    /**
     * The selected value. A single Select gives one value or `null`. A Select with `multiple` gives a list of values.
     *
     * `''`, `null` and an empty list mean nothing is selected.
     *
     * @cckSemantic none
     * @cckParity Slot prop: the model of the root.
     */
    modelValue: SelectValueOf<T, M>;
    /**
     * Whether the list is open.
     * @cckSemantic none
     * @cckParity Slot prop: the open state of the root.
     */
    open: boolean;
  }): unknown;
}>();

const id = useId();
// The own `dir` is the direction of the subtree, as a provider would set it: the keys and the parts read it.
provideDirection(useDirection(() => props.dir));
const attrs = useAttrs();
const field = useFormFieldContext();
const themeAttrs = useThemeAttrs(selectAnatomy);
const typeahead = createTypeahead();
const { model, openModel, mountValue, multiple, current, single, chosen, write, same, entries } = useSelectModel<T, M>(
  props,
);

const trigger = liveElementRef();
const triggerElement = trigger.element;
const contentElement = shallowRef<HTMLElement | null>(null);
const mounted = shallowRef(false);
const keptClosed = shallowRef(false);
const layerActive = shallowRef(false);
const triggerAria = shallowRef<SelectTriggerAria>({ label: undefined, labelledby: undefined, describedby: undefined });
const focused = ref(false);
const touched = ref(false);
const dirty = ref(false);
// The hidden input's `invalid` event: the trigger shows the state and the browser's message until the value changes.
const rejected = ref(false);
const rejection = ref('');
// A new key makes the hidden inputs again, so the browser's reset (which clears them) cannot leave one empty.
const inputsKey = ref(0);
// An outside press is being decided: the focus move it causes must not close the list on its own.
let focusOutHeld = false;

const primary = useFieldControl(
  field,
  triggerElement,
  () => parts.value.control,
  'gets no generated id and no description from the field, and its state does not reach the field',
);
const participation = useFormParticipation({
  elementRef: computed(() => triggerElement.value as HTMLButtonElement | null),
  getValue: () => (triggerElement.value as HTMLButtonElement | null)?.value ?? '',
  onReset: () => {
    touched.value = false;
    dirty.value = false;
    rejected.value = false;
    inputsKey.value += 1;
    model.value = mountValue;
  },
});

const isDisabled = computed(() => props.disabled === true || participation.fieldsetDisabled.value);
const interactive = computed(
  () => ![isDisabled.value, props.readonly, field?.own.value.disabled, field?.own.value.readOnly].some(Boolean),
);
const isOpen = computed(() => openModel.value === true && interactive.value);
const { registry, items, registerItem } = useSelectRegistry<T>(isOpen);

/** The trigger text of a value: its `items` label, else `itemToStringLabel`, else `String`. No item registers it. */
function labelOf(value: T): string {
  const entry = entries.value.find((candidate) => same(candidate.value, value));
  if (entry) return entry.label;
  return props.itemToStringLabel ? props.itemToStringLabel(value) : String(value);
}

const baseState = computed<SelectState<T>>(() => ({
  id,
  open: isOpen.value,
  mounted: mounted.value,
  keptClosed: keptClosed.value && !isOpen.value,
  items: items.value,
  value: model.value,
  multiple: multiple.value,
  itemToStringLabel: labelOf,
  itemToStringValue: props.itemToStringValue,
  isItemEqual: same,
  labelledBy: triggerAria.value.labelledby,
  ariaLabel: triggerAria.value.label,
  typeahead,
  ariaDescribedBy: triggerAria.value.describedby,
  name: props.name,
  disabled: isDisabled.value,
  readOnly: props.readonly,
  required: props.required,
  invalid: props.invalid,
  blockedSubmit: rejected.value,
  touched: touched.value,
  dirty: dirty.value,
  submitted: participation.submitted.value,
  focused: focused.value,
}));
const { highlighted, reveal, begin } = useSelectHighlight<T>({ isOpen, registry, state: () => baseState.value });
const state = computed<SelectState<T>>(() => ({
  ...baseState.value,
  highlighted: isOpen.value ? highlighted.value : undefined,
}));

/** The item an event chooses: the clicked one, else the highlighted one. */
function chosenItem(event: SelectEvent): SelectItemRegistration<T> | undefined {
  const key = event.type === 'OPTION.CLICK' ? event.key : state.value.highlighted;
  return registry.value.find((item) => item.key === key);
}

/** Whether the `select` listeners of the item the event chooses refuse the choice. */
function refusedByItem(event: SelectEvent): boolean {
  const original = 'event' in event && event.event ? event.event : new Event('select');
  return chosenItem(event)?.select(original) ?? false;
}

function send(event: SelectEvent): void {
  const next = transitionSelect(state.value, event);
  if (!next) return;
  // A refused choice keeps the list as it is, except on a dismissal: that still closes.
  const refused = next.value !== undefined && refusedByItem(event);
  if (refused && event.type !== 'LIST.DISMISS') return;
  const value = refused ? undefined : next.value;
  if (next.open?.open) begin(event.type === 'TRIGGER.OPEN' ? event.initial : 'selected');
  if (next.highlight !== undefined) highlighted.value = next.highlight ?? undefined;
  if (next.reveal) reveal();
  if (value !== undefined) {
    dirty.value = true;
    write(value);
  }
  if (next.open) {
    openModel.value = next.open.open;
  }
}

const parts = computed(() =>
  getSelectProps<T>(
    state.value,
    send,
    field ? { ids: primary.value ? field.ids.value : undefined, state: field.own.value } : undefined,
  ),
);

onBeforeUnmount(() => {
  typeahead.reset();
});

// A click on the label of a field forwards a click to the trigger: it takes the focus and does not open.
let labelActivation: LabelActivation | undefined;
watch(
  triggerElement,
  (element, _previous, onCleanup) => {
    if (!element) return;
    const activation = trackLabelActivation(element);
    labelActivation = activation;
    onCleanup(() => {
      activation.destroy();
      labelActivation = undefined;
    });
  },
  { flush: 'post' },
);
onMounted(() => {
  if (isDevelopment() && typeof requestAnimationFrame === 'function') {
    // After the Label's `for` has committed.
    const frame = requestAnimationFrame(() => {
      if (triggerElement.value && !hasAccessibleName(triggerElement.value)) {
        console.warn(
          `CocoKits: a Select ${field ? 'in a FormField ' : ''}has no accessible name. Add a Label to the FormField, or an aria-label or aria-labelledby to the SelectTrigger.`,
        );
      }
    });
    onBeforeUnmount(() => {
      cancelAnimationFrame(frame);
    });
  }
});

/** A printable key without Ctrl, Meta or Alt; a space opens the list instead. */
const isPrintable = (event: KeyboardEvent): boolean =>
  event.key.length === 1 && event.key !== ' ' && !event.altKey && !event.ctrlKey && !event.metaKey;

const triggerHandlers: SelectTriggerHandlers = {
  onClick(event) {
    if (labelActivation?.consume()) {
      triggerElement.value?.focus();
      return;
    }
    // Safari never focuses a button on a press, and Firefox does not when the press moves focus into a frame: the
    // list opens with the focus on the trigger, where the keys and `aria-activedescendant` work.
    const element = triggerElement.value;
    if (
      interactive.value &&
      !event.defaultPrevented &&
      element &&
      deepActiveElement(element.ownerDocument) !== element
    ) {
      element.focus({ preventScroll: true });
    }
    parts.value.trigger.onClick(event);
  },
  onKeydown(event) {
    // The items mount with the list: a character typed on a closed Select opens it and finds its item then.
    if (
      !isOpen.value &&
      items.value.length === 0 &&
      interactive.value &&
      !event.defaultPrevented &&
      isPrintable(event)
    ) {
      event.preventDefault();
      send({ type: 'TRIGGER.OPEN', initial: 'selected', event });
      begin('selected', event.key);
      return;
    }
    // The list's dismiss layer answers Escape, so that the Content emits can refuse it.
    if (event.key === 'Escape' && isOpen.value && layerActive.value) return;
    parts.value.trigger.onKeyDown(event);
  },
  onKeyup: (event) => {
    parts.value.trigger.onKeyUp(event);
  },
  onFocus() {
    focused.value = true;
  },
  onBlur(event) {
    if (!focusOutHeld) parts.value.trigger.onBlur(event);
    typeahead.reset();
    focused.value = false;
    touched.value = true;
  },
};

function onInvalid(event: Event): void {
  rejected.value = true;
  rejection.value = (event.target as HTMLInputElement).validationMessage;
  // The browser focuses the invalid input right after the event, so the trigger takes the focus back after it.
  triggerElement.value?.focus();
  setTimeout(() => {
    triggerElement.value?.focus();
  }, 0);
}

watch(model, () => {
  rejected.value = false;
});

/**
 * A browser autofill wrote to the hidden input of a single Select: it picks the enabled item whose form string it
 * is. The mounted items are the candidates while the list is open, the `items` data while it is closed. Without a
 * match, or in a multiple Select, the input goes back to the current value.
 */
function onFormWrite(event: Event): void {
  const written = (event.target as HTMLInputElement).value;
  if (multiple.value || !interactive.value) {
    inputsKey.value += 1;
    return;
  }
  const candidates: { value: T; disabled: boolean; item?: SelectItemRegistration<T> }[] =
    registry.value.length > 0
      ? registry.value.map((item) => ({ value: item.value, disabled: item.disabled, item }))
      : entries.value.map((entry) => ({ value: entry.value, disabled: entry.disabled === true }));
  const match = candidates.find(
    (candidate) => !candidate.disabled && valueToFormString(state.value, candidate.value) === written,
  );
  if (!match) {
    inputsKey.value += 1;
    return;
  }
  const selected = single();
  if (selected !== null && same(selected, match.value)) return;
  if (match.item?.select(event)) {
    inputsKey.value += 1;
    return;
  }
  dirty.value = true;
  write(match.value);
}

provideSelect({
  parts,
  open: isOpen,
  mounted,
  triggerElement,
  followTrigger: trigger.follow,
  anchorElement: computed(() => (primary.value ? field?.inputWrapper.value : null) ?? triggerElement.value),
  contentElement,
  keptClosed,
  layerActive,
  multiple,
  form: computed(() => props.form),
  empty: computed(() => isSelectEmpty(state.value)),
  modelValue: current,
  selectedLabels: computed(() => getSelectPreviewValues(state.value).map(labelOf)),
  valueText: computed(() => getSelectValueText(state.value)),
  send,
  setTriggerAria: (aria: SelectTriggerAria) => {
    const current = triggerAria.value;
    if (
      current.label !== aria.label ||
      current.labelledby !== aria.labelledby ||
      current.describedby !== aria.describedby
    )
      triggerAria.value = aria;
  },
  trigger: triggerHandlers,
  holdFocusOut: (hold: boolean) => {
    focusOutHeld = hold;
  },
  registerItem,
  valueChangeMatters: (previous: T, next: T) => {
    return !same(previous, next) && chosen().some((value) => same(value, previous) || same(value, next));
  },
});

/** What the default slot receives. */
const slotProps = computed(() => ({ modelValue: current.value, open: isOpen.value }));
/** The hidden inputs render for a name or for required; a cleared single Select carries `nullableValue`. */
const formEntries = computed(() => {
  const { name, required, values } = parts.value.formInput;
  if (!name && !required) return [];
  if (multiple.value) return values.length === 0 && required ? [''] : values;
  return isSelectEmpty(state.value) ? [props.nullableValue] : values;
});
/**
 * The attrs are not reactive, so the template reads them through a function. The machine's facts win. The element
 * renders the author's `dir` only; the resolved direction drives the keys and the placement, not the markup.
 */
const rootBound = (): Record<string, unknown> => ({
  ...omit(attrs, 'class', ...formFieldStateAttrs, 'data-state', 'data-multiple', 'data-placeholder-shown'),
  ...themeAttrs.value.root,
  dir: props.dir,
  ...omit(parts.value.root, 'class'),
  class: [parts.value.root.class, attrs.class],
});

/** What the root holds: the author's parts, then the hidden form inputs and the validation message. */
function inner(content?: VNode[]): VNode[] {
  const { formInput, validationMessage } = parts.value;
  return [
    ...(content ?? []),
    ...formEntries.value.map((entry, index) =>
      h('input', {
        key: [inputsKey.value, index].join(':'),
        type: 'text',
        tabindex: -1,
        'aria-hidden': 'true',
        autocomplete: props.autocomplete ?? 'off',
        style: visuallyHiddenStyle,
        name: formInput.name,
        form: props.form,
        required: formInput.required,
        disabled: formInput.disabled,
        value: entry,
        onInvalid,
        onInput: onFormWrite,
        onChange: onFormWrite,
      }),
    ),
    ...(rejected.value ? [h('span', { ...validationMessage, style: visuallyHiddenStyle }, rejection.value)] : []),
  ];
}
/** The default content of the root when it renders its own element. */
const Body: FunctionalComponent = (_props, { slots: { default: content } }) => inner(content?.());

defineExpose({
  /**
   * The trigger element. `null` before mount.
   *
   * @cckSemantic none
   * @cckParity Templates reach the DOM node through the component ref.
   */
  get element(): HTMLElement | null {
    return triggerElement.value;
  },
});
</script>

<template>
  <Primitive
    as="div"
    :as-child="asChild"
    v-bind="rootBound()"
    :priority-attrs="Object.keys(omit(parts.root, 'class'))"
    :as-child-content="inner"
  >
    <slot v-if="asChild" v-bind="slotProps" />
    <Body v-else><slot v-bind="slotProps" /></Body>
  </Primitive>
</template>
