<script setup lang="ts">
import {
  computed,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  useAttrs,
  useTemplateRef,
  watch,
  type ComponentPublicInstance,
} from 'vue';
import { trackActiveIndicator, type ActiveIndicator } from '@cocokits/cdk/active-indicator';
import { getTabsProps, tabsAnatomy } from '@cocokits/machines/tabs';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import { useTabsContext } from './tabs.context';
import type { TabsIndicatorProps } from './tabs.types';

defineOptions({ name: 'CckTabsIndicator', inheritAttrs: false });

withDefaults(defineProps<TabsIndicatorProps>(), { as: 'span', asChild: false });

const ctx = useTabsContext('TabsIndicator');
const themeAttrs = useThemeAttrs(tabsAnatomy);
const attrs = useAttrs();
const bound = computed(() =>
  mergeProps(themeAttrs.value.indicator, attrs, { ...getTabsProps(ctx.state.value, ctx.dispatch).indicator }),
);
const priorityAttrs = ['aria-hidden'];

const root = useTemplateRef<ComponentPublicInstance>('root');
const indicatorElement = (): HTMLElement | null => rootElementOf(root.value) as HTMLElement | null;
let tracker: ActiveIndicator | undefined;

// The list is the parent: the indicator is a direct child of it. The base writes the `--active-tab-*` variables
// after mount and keeps them current while the list or any trigger resizes.
onMounted(() => {
  tracker = trackActiveIndicator({
    getList: () => indicatorElement()?.parentElement ?? null,
    getItems: () => ctx.getEntries().flatMap((entry) => entry.element() ?? []),
    getActiveItem: () => {
      const selected = ctx.selected.value;
      return selected === undefined ? null : (ctx.getTrigger(selected) ?? null);
    },
    getIndicator: indicatorElement,
  });
  tracker.update();
});
watch(
  () => [ctx.selected.value, ctx.items.value, ctx.orientation.value] as const,
  () => {
    tracker?.update();
  },
  { flush: 'post' },
);
onBeforeUnmount(() => {
  tracker?.destroy();
  tracker = undefined;
});
</script>

<template>
  <Primitive ref="root" v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs" />
</template>
