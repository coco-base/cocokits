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
import { nonEmpty } from '../internal/form-field-context';
import { toVueListeners } from '../internal/listeners';
import { RADIO_GROUP_KEY, type RadioGroupRegistration } from '../internal/radio-group-context';
import { omit } from '../internal/record';
import { rootElementOf } from '../internal/root-element';
import { useDefaultModel } from '../internal/use-default-model';
import type { RadioGroupEmits, RadioGroupProps } from './radio-group.types';

defineOptions({ name: 'CckRadioGroup', inheritAttrs: false });

const props = withDefaults(defineProps<RadioGroupProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  name: undefined,
  disabled: undefined,
  required: undefined,
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
  /** The radios, in any markup. */
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
  form: props.form,
  orientation: props.orientation,
  loop: props.loop,
  dir: direction.value,
  mounted: mounted.value,
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
  if ((model.value ?? null) === mountValue) syncAll();
  else setValue(mountValue);
}

function dispatch(event: RadioGroupEvent): void {
  const result = transitionRadioGroup(state.value, event);
  if (result.focus !== undefined) inputOf(result.focus)?.focus();
  if (result.activate !== undefined) inputOf(result.activate)?.click();
}

const parts = computed(() => getRadioGroupProps(state.value, dispatch));

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
// The element renders the author's `dir` only; the resolved direction drives the keys, not the markup.
const bound = computed(() =>
  mergeProps(themeAttrs.value.root, attrs, { dir: props.dir }, omit(toVueListeners(parts.value.root), 'onKeydown'), {
    onKeydown,
  }),
);
const priorityAttrs = [
  'role',
  'aria-required',
  'aria-disabled',
  'aria-orientation',
  'data-disabled',
  'data-required',
  'data-orientation',
];

const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the root: the `<div>`, or the element of the `as` component or `asChild` child.
   * `null` before mount.
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
