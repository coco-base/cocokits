<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  provide,
  shallowRef,
  useAttrs,
  watch,
} from 'vue';
import { deepActiveElement, trackFocusVisible, type FocusVisibleTracker } from '@cocokits/cdk/focus';
import {
  accordionAnatomy,
  getAccordionProps,
  transitionAccordion,
  type AccordionEvent,
  type AccordionItem,
  type AccordionState,
} from '@cocokits/machines/accordion';
import { containsDeep, sortByDomOrder } from '@cocokits/utils';
import { isPropWritten, Primitive, provideDirection, useDirection, useThemeAttrs } from '@cocokits/vue-core';
import { useDefaultModel } from '../internal/use-default-model';
import { ACCORDION_KEY, type AccordionRegistration } from './accordion.context';
import type { AccordionRootEmits, AccordionRootProps } from './accordion.types';

defineOptions({ name: 'CckAccordionRoot', inheritAttrs: false });

const props = withDefaults(defineProps<AccordionRootProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  type: undefined,
  collapsible: false,
  disabled: false,
  orientation: 'vertical',
  dir: undefined,
  unmountOnHide: true,
  as: 'div',
  asChild: false,
});
const emit = defineEmits<AccordionRootEmits>();
defineSlots<{
  /**
   * The items of the accordion. The slot gives you the open value. When not set, the accordion has no items.
   *
   * @example
   * <AccordionRoot v-model="open" #default="{ modelValue }">
   *   <p>Open: {{ modelValue }}</p>
   *   <AccordionItem value="shipping">...</AccordionItem>
   * </AccordionRoot>
   */
  default?(props: {
    /**
     * The open value. In `single` mode it is the value of the open item, or `undefined` when none is open. In
     * `multiple` mode it is the list of open values.
     *
     * @cckSemantic none
     * @cckParity Slot prop: the model of the root.
     */
    modelValue: string | string[] | undefined;
  }): unknown;
}>();

const attrs = useAttrs();
const themeAttrs = useThemeAttrs(accordionAnatomy);
// The own `dir` is the direction of the subtree, as a provider would set it: keys and nested parts.
const direction = useDirection(() => props.dir);
provideDirection(direction);
const model = useDefaultModel(props, 'modelValue', props.defaultValue);
const instance = getCurrentInstance();
// A single accordion the user emptied. The model cannot say it: an unbound `undefined` reads as `defaultValue`.
const emptied = shallowRef(false);

// A list is `multiple`, anything else `single`.
const type = computed(() => props.type ?? (Array.isArray(model.value) ? 'multiple' : 'single'));
// The open keys. `single` holds at most one.
const keys = computed<readonly string[]>(() => {
  const value = model.value;
  if (value === undefined || (emptied.value && !isPropWritten(instance, 'modelValue'))) return [];
  const list = Array.isArray(value) ? value : [value];
  return type.value === 'multiple' ? list : list.slice(0, 1);
});

const registry = new Set<AccordionRegistration>();
// The registered items in document order. Empty on the server and in the first client render, so the markup matches.
const items = shallowRef<readonly AccordionItem[]>([]);
const focusVisibleKey = shallowRef<string | undefined>(undefined);
let tracker: FocusVisibleTracker | undefined;

const sameItems = (a: readonly AccordionItem[], b: readonly AccordionItem[]): boolean =>
  a.length === b.length && a.every((item, index) => item.key === b[index]?.key && item.disabled === b[index]?.disabled);

function refresh(): void {
  const byElement = new Map(
    [...registry].flatMap((entry) => {
      const element = entry.trigger();
      return element ? [[element, entry] as const] : [];
    }),
  );
  const ordered = sortByDomOrder([...byElement.keys()]).flatMap((element) => byElement.get(element) ?? []);
  const next = ordered.map((entry): AccordionItem => ({ key: entry.value(), disabled: entry.disabled() }));
  if (!sameItems(items.value, next)) items.value = next;
}

function register(entry: AccordionRegistration): () => void {
  registry.add(entry);
  refresh();
  return () => {
    registry.delete(entry);
    refresh();
  };
}

function find(key: string): AccordionRegistration | undefined {
  for (const entry of registry) if (entry.value() === key) return entry;
  return undefined;
}

/** The key of the item whose content holds the focus, read from the DOM when an event is sent. */
function focusedKey(): string | undefined {
  const active = typeof document === 'undefined' ? null : deepActiveElement(document);
  if (!active) return undefined;
  for (const entry of registry) {
    const content = entry.content();
    if (content && containsDeep(content, active)) return entry.value();
  }
  return undefined;
}

const state = computed<AccordionState>(() => ({
  items: items.value,
  value: keys.value,
  type: type.value,
  collapsible: props.collapsible,
  disabled: props.disabled,
  orientation: props.orientation,
  dir: direction.value,
  focusVisibleKey: focusVisibleKey.value,
}));

function applyFocus(key: string | undefined): void {
  if (key !== undefined) find(key)?.trigger()?.focus();
}

function dispatch(event: AccordionEvent): void {
  const result = transitionAccordion({ ...state.value, focusInContent: focusedKey() }, event);
  if (result.value) {
    const next = [...result.value];
    if (type.value === 'single' && next.length === 0) {
      // `single` reports `undefined` when the last item closes.
      emptied.value = true;
      emit('update:modelValue', undefined);
    } else {
      emptied.value = false;
      model.value = type.value === 'multiple' ? next : next[0]; // emits update:modelValue
    }
  }
  // Before the content is hidden or removed, so focus is never lost to the body.
  applyFocus(result.focus);
}

// A value the parent wrote closes an item too: focus inside it moves to its trigger before the content goes. The
// watcher runs before the render, so the DOM still shows the content.
watch(
  keys,
  (_next, previous) => {
    const result = transitionAccordion(
      { ...state.value, value: previous, focusInContent: focusedKey() },
      { type: 'VALUE.SYNC', value: keys.value },
    );
    applyFocus(result.focus);
  },
  { flush: 'pre' },
);

onMounted(() => {
  tracker = trackFocusVisible(document);
  refresh();
});
onUpdated(refresh);
onBeforeUnmount(() => {
  tracker?.destroy();
  tracker = undefined;
});

provide(ACCORDION_KEY, {
  state,
  dispatch,
  unmountOnHide: computed(() => props.unmountOnHide),
  register,
  refresh,
  focusTrigger: (key) => {
    focusVisibleKey.value = tracker?.isFocusVisible() ? key : undefined;
  },
  blurTrigger: () => {
    focusVisibleKey.value = undefined;
  },
});

// The element renders the author's `dir` only; the resolved direction drives the keys, not the markup.
const bound = computed(() =>
  mergeProps(themeAttrs.value.root, attrs, { dir: props.dir }, { ...getAccordionProps(state.value) }),
);
const slotValue = computed(() => (type.value === 'multiple' ? [...keys.value] : keys.value[0]));
</script>

<template>
  <Primitive
    v-bind="bound"
    :as="as"
    :as-child="asChild"
    :priority-attrs="['data-orientation', 'data-disabled', 'data-multiple']"
  >
    <slot :model-value="slotValue" />
  </Primitive>
</template>
