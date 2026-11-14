<script setup lang="ts" generic="T extends string | number">
import { computed, mergeProps, onBeforeUnmount, onMounted, onUpdated, provide, shallowRef, useAttrs, useId } from 'vue';
import { trackFocusVisible, type FocusVisibleTracker } from '@cocokits/cdk/focus';
import {
  getTabsProps,
  resolveSelectedTab,
  tabsAnatomy,
  transitionTabs,
  type TabsEvent,
  type TabsItem,
  type TabsState,
  type TabsValue,
} from '@cocokits/machines/tabs';
import { sortByDomOrder } from '@cocokits/utils';
import { Primitive, provideDirection, useDirection, useThemeAttrs } from '@cocokits/vue-core';
import { selectTabsValue, useTabsModel } from './use-tabs-model';
import { TABS_KEY, type TabsRegistration } from './tabs.context';
import type { TabsRootEmits, TabsRootProps } from './tabs.types';

defineOptions({ name: 'CckTabsRoot', inheritAttrs: false });

const props = withDefaults(defineProps<TabsRootProps<T>>(), {
  modelValue: undefined,
  defaultValue: undefined,
  orientation: 'horizontal',
  activationMode: 'automatic',
  unmountOnHide: true,
  dir: undefined,
  as: 'div',
  asChild: false,
});
defineEmits<TabsRootEmits<T>>();
defineSlots<{
  /**
   * The tabs: a `TabsList` and one `TabsContent` per trigger. The slot gives you the selected value. When not set,
   * the tabs are empty.
   *
   * @example
   * <TabsRoot v-model="tab" #default="{ modelValue }">
   *   <TabsList aria-label="Account settings">...</TabsList>
   *   <p>Selected: {{ modelValue }}</p>
   * </TabsRoot>
   */
  default?(props: {
    /**
     * The value of the selected tab. It is `undefined` until a tab is selected, when no value was given.
     *
     * @cckSemantic none
     * @cckParity Slot prop: the model of the root.
     */
    modelValue: T | undefined;
  }): unknown;
}>();

const attrs = useAttrs();
const themeAttrs = useThemeAttrs(tabsAnatomy);
// The own `dir` is the direction of the subtree, as a provider would set it: keys, placement and nested parts.
const direction = useDirection(() => props.dir);
provideDirection(direction);
const id = useId();
const model = useTabsModel(props);

const registry = new Set<TabsRegistration>();
// The registered tabs in document order. Empty on the server and in the first client render, so the markup matches.
const items = shallowRef<readonly TabsItem[]>([]);
// The first resolved value, kept once so the selection never moves on its own (a disabled first tab).
const pinned = shallowRef<TabsValue | undefined>(undefined);
// The first enabled trigger in setup order. Setup runs in tree order on the server and in the first client
// render, so both pick the same tab before any trigger has mounted.
const initial = shallowRef<TabsValue | undefined>(undefined);
const focusVisibleValue = shallowRef<TabsValue | undefined>(undefined);
let tracker: FocusVisibleTracker | undefined;

const state = computed<TabsState>(() => ({
  id,
  items: items.value,
  value: model.value ?? pinned.value ?? initial.value,
  keepContent: !props.unmountOnHide,
  orientation: props.orientation,
  activationMode: props.activationMode,
  dir: direction.value,
  focusVisibleValue: focusVisibleValue.value,
}));
const selected = computed(() => resolveSelectedTab(items.value, state.value.value));

const sameItems = (a: readonly TabsItem[], b: readonly TabsItem[]): boolean =>
  a.length === b.length &&
  a.every((item, index) => item.value === b[index]?.value && item.disabled === b[index]?.disabled);

// The mounted triggers in document order.
function getEntries(): readonly TabsRegistration[] {
  const byElement = new Map(
    [...registry].flatMap((entry) => {
      const element = entry.element();
      return element ? [[element, entry] as const] : [];
    }),
  );
  return sortByDomOrder([...byElement.keys()]).flatMap((element) => byElement.get(element) ?? []);
}

function refresh(): void {
  const next = getEntries().map((entry): TabsItem => ({ value: entry.value(), disabled: entry.disabled() }));
  if (!sameItems(items.value, next)) items.value = next;
  if (model.value === undefined && pinned.value === undefined) {
    const first = resolveSelectedTab(next, undefined);
    if (first !== undefined) pinned.value = first;
  }
}

function claimInitial(value: TabsValue, disabled: boolean): void {
  if (initial.value === undefined && !disabled) initial.value = value;
}

function register(entry: TabsRegistration): () => void {
  registry.add(entry);
  refresh();
  return () => {
    registry.delete(entry);
    refresh();
  };
}

function getTrigger(value: TabsValue): HTMLElement | undefined {
  for (const entry of registry) if (entry.value() === value) return entry.element() ?? undefined;
  return undefined;
}

function dispatch(event: TabsEvent): void {
  const result = transitionTabs(state.value, event);
  if (result.select !== undefined) {
    selectTabsValue(model, result.select); // emits update:modelValue
  }
  if (result.focus !== undefined) getTrigger(result.focus)?.focus();
}

function focusTrigger(value: TabsValue): void {
  focusVisibleValue.value = tracker?.isFocusVisible() ? value : undefined;
}

function blurTrigger(): void {
  focusVisibleValue.value = undefined;
}

onMounted(() => {
  tracker = trackFocusVisible(document);
  refresh();
});
onUpdated(refresh);
onBeforeUnmount(() => {
  tracker?.destroy();
  tracker = undefined;
});

provide(TABS_KEY, {
  state,
  dispatch,
  selected,
  orientation: computed(() => props.orientation),
  activationMode: computed(() => props.activationMode),
  items: computed(() => items.value),
  getEntries,
  register,
  claimInitial,
  refresh,
  getTrigger,
  focusTrigger,
  blurTrigger,
});

/** The root renders no handler, so the props it computes need no `send`. */
const ignore = (): void => undefined;
// The element renders the author's `dir` only; the resolved direction drives the keys, not the markup.
const bound = computed(() =>
  mergeProps(themeAttrs.value.root, attrs, { dir: props.dir }, { ...getTabsProps(state.value, ignore).root }),
);
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="['data-orientation']">
    <slot :model-value="selected as T | undefined" />
  </Primitive>
</template>
