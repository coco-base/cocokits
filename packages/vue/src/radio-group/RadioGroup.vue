<script setup lang="ts">
import {
  computed,
  mergeProps,
  nextTick,
  onMounted,
  onUpdated,
  provide,
  shallowRef,
  useAttrs,
  useId,
  useTemplateRef,
  type ComponentPublicInstance,
} from 'vue';
import {
  getRadioGroupProps,
  radioGroupAnatomy,
  transitionRadioGroup,
  type RadioGroupEvent,
  type RadioGroupItem,
  type RadioGroupState,
} from '@cocokits/machines/radio-group';
import { sortByDomOrder } from '@cocokits/utils';
import { Primitive, provideDirection, useDirection, useThemeAttrs } from '@cocokits/vue-core';
import { nonEmpty, useFormFieldContext } from '../internal/form-field-context';
import { toVueListeners } from '../internal/listeners';
import { RADIO_GROUP_KEY, type RadioGroupRegistration } from '../internal/radio-group-context';
import { omit } from '../internal/record';
import { rootElementOf } from '../internal/root-element';
import { useDefaultModel } from '../internal/use-default-model';
import { useFieldControl } from '../internal/use-field-control';
import type { RadioGroupEmits, RadioGroupProps } from './radio-group.types';

defineOptions({ name: 'CckRadioGroup', inheritAttrs: false });

const props = withDefaults(defineProps<RadioGroupProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  name: undefined,
  disabled: undefined,
  required: undefined,
  touched: undefined,
  form: undefined,
  orientation: undefined,
  loop: true,
  dir: undefined,
  as: 'div',
  asChild: false,
});
// `update:modelValue` is emitted by the model.
defineEmits<RadioGroupEmits>();
defineSlots<{
  /**
   * The radios, in any markup. When not set, the group is empty.
   *
   * @example
   * <RadioGroup v-model="plan" aria-label="Plan">
   *   <p>Pick one.</p>
   *   <Radio value="free">Free</Radio>
   *   <Radio value="pro">Pro</Radio>
   * </RadioGroup>
   */
  default?(): unknown;
}>();

const attrs = useAttrs();
const themeAttrs = useThemeAttrs(radioGroupAnatomy);
// The own `dir` is the direction of the subtree, as a provider would set it: keys and nested parts.
const direction = useDirection(() => props.dir);
provideDirection(direction);
const generatedName = `cck-radio-group-${useId()}`;
const model = useDefaultModel(props, 'modelValue', props.defaultValue);
// The value the group starts with: a form reset returns to it.
const mountValue = model.value ?? null;

const field = useFormFieldContext();
const root = useTemplateRef<ComponentPublicInstance>('root');
const element = computed(() => rootElementOf(root.value) as HTMLElement | null);
// Set when the focus leaves the group; a `touched` you pass wins. A form reset clears it.
const touchedState = shallowRef(false);
// Set when a radio blocked a submit of the owner form; a form reset clears it.
const submitted = shallowRef(false);
const stringOf = (attr: unknown): string | undefined => (typeof attr === 'string' ? attr : undefined);

const registry = new Set<RadioGroupRegistration>();
// The registered radios in document order. Empty on the server and in the first client render, so the markup matches.
const items = shallowRef<readonly RadioGroupItem[]>([]);
const mounted = shallowRef(false);
let lastReset: Event | undefined;

const state = computed<RadioGroupState>(() => ({
  value: model.value ?? null,
  name: nonEmpty(props.name) ?? generatedName,
  items: items.value,
  disabled: props.disabled,
  required: props.required,
  touched: props.touched ?? touchedState.value,
  submitted: submitted.value,
  form: props.form,
  orientation: props.orientation,
  loop: props.loop,
  dir: direction.value,
  mounted: mounted.value,
  id: nonEmpty(stringOf(attrs.id)),
  ariaLabel: stringOf(attrs['aria-label']),
  ariaLabelledBy: stringOf(attrs['aria-labelledby']),
  ariaDescribedBy: stringOf(attrs['aria-describedby']),
}));

const sameItems = (a: readonly RadioGroupItem[], b: readonly RadioGroupItem[]): boolean =>
  a.length === b.length &&
  a.every((item, index) => {
    const other = b.at(index);
    return (
      other !== undefined &&
      item.value === other.value &&
      item.disabled === other.disabled &&
      item.required === other.required &&
      item.form === other.form
    );
  });

function refresh(): void {
  const byElement = new Map(
    [...registry].flatMap((entry) => {
      const element = entry.element();
      return element ? [[element, entry] as const] : [];
    }),
  );
  const next = sortByDomOrder([...byElement.keys()]).flatMap((element): RadioGroupItem[] => {
    const entry = byElement.get(element);
    return entry
      ? [{ value: entry.value(), disabled: entry.disabled(), required: entry.required(), form: entry.form() }]
      : [];
  });
  if (!sameItems(items.value, next)) items.value = next;
}

function register(entry: RadioGroupRegistration): () => void {
  registry.add(entry);
  refresh();
  return () => {
    registry.delete(entry);
    refresh();
  };
}

/** The input of the registered radio with this value. */
function inputOf(value: string): HTMLInputElement | null {
  for (const entry of registry) if (entry.value() === value) return entry.element();
  return null;
}

/** The value of the registered radio whose input is the target of the event. */
function currentOf(event: Event): string | undefined {
  for (const entry of registry) if (entry.element() === event.target) return entry.value();
  return undefined;
}

/** The native check moved on its own; the DOM must show the value the group holds. */
function syncAll(): void {
  void nextTick(() => {
    for (const entry of registry) entry.sync();
  });
}

function setValue(value: string | null): void {
  model.value = value; // emits update:modelValue
  syncAll();
}

function userChecked(value: string | undefined): void {
  if (value === undefined || value === model.value) {
    syncAll();
    return;
  }
  setValue(value);
}

function formReset(event: Event): void {
  // Every radio of the group reports the same reset.
  if (event === lastReset) return;
  lastReset = event;
  touchedState.value = false;
  submitted.value = false;
  if ((model.value ?? null) === mountValue) syncAll();
  else setValue(mountValue);
}

function dispatch(event: RadioGroupEvent): void {
  const result = transitionRadioGroup(state.value, event);
  if (result.focus !== undefined) inputOf(result.focus)?.focus();
  if (result.activate !== undefined) inputOf(result.activate)?.click();
}

const primary = useFieldControl(
  field,
  element,
  () => parts.value.control,
  'gets no generated id and no description from the field, and its state does not reach the field',
);

const parts = computed(() =>
  getRadioGroupProps(
    state.value,
    dispatch,
    field
      ? { ids: primary.value ? field.ids.value : undefined, state: field.own.value, hasLabel: field.hasLabel.value }
      : undefined,
  ),
);

onMounted(() => {
  mounted.value = true;
  refresh();
});
onUpdated(refresh);

provide(RADIO_GROUP_KEY, {
  facts: (item) => parts.value.radio(item),
  register,
  refresh,
  userChecked,
  formReset,
});

// A consumer's keydown runs first (`mergeProps` chains it before ours); the machine skips a vetoed key.
function onKeydown(event: KeyboardEvent): void {
  parts.value.root.onKeyDown(event, currentOf(event));
}
// `invalid` does not bubble: the group listens in the capture phase for a submit its radios blocked.
function onInvalidCapture(): void {
  submitted.value = true;
}
function onFocusout(event: FocusEvent): void {
  if (event.relatedTarget instanceof Node && element.value?.contains(event.relatedTarget)) return;
  touchedState.value = true;
}
// The element renders the author's `dir` only; the resolved direction drives the keys, not the markup.
const bound = computed(() =>
  mergeProps(themeAttrs.value.root, attrs, { dir: props.dir }, omit(toVueListeners(parts.value.root), 'onKeydown'), {
    onKeydown,
    onInvalidCapture,
    onFocusout,
  }),
);
const priorityAttrs = [
  'role',
  'id',
  'aria-label',
  'aria-labelledby',
  'aria-describedby',
  'aria-required',
  'aria-disabled',
  'aria-invalid',
  'aria-orientation',
  'data-disabled',
  'data-required',
  'data-invalid',
  'data-orientation',
];

defineExpose({
  /**
   * The DOM element of the root: the `<div>`, or the element of the `as` component or the `asChild` child. It is
   * `null` before mount.
   *
   * @example
   * <RadioGroup ref="plans" v-model="plan" aria-label="Plan">...</RadioGroup>
   * <!-- In the script: const plans = useTemplateRef('plans'); then plans.value?.element is the root. -->
   *
   * @cckSemantic none
   * @cckParity Templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return rootElementOf(root.value);
  },
});
</script>

<template>
  <Primitive ref="root" v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot />
  </Primitive>
</template>
