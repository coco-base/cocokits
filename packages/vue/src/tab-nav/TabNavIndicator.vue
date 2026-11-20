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
import { getTabNavProps, tabNavAnatomy } from '@cocokits/machines/tab-nav';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import { useTabNavContext } from './tab-nav.context';
import type { TabNavIndicatorProps } from './tab-nav.types';

defineOptions({ name: 'CckTabNavIndicator', inheritAttrs: false });

withDefaults(defineProps<TabNavIndicatorProps>(), { as: 'span', asChild: false });

const ctx = useTabNavContext('TabNavIndicator');
const themeAttrs = useThemeAttrs(tabNavAnatomy);
const attrs = useAttrs();
const bound = computed(() =>
  mergeProps(themeAttrs.value.indicator, attrs, { ...getTabNavProps({ panelId: ctx.panelId.value }).indicator }),
);
const priorityAttrs = ['aria-hidden'];

const root = useTemplateRef<ComponentPublicInstance>('root');
const indicatorElement = (): HTMLElement | null => rootElementOf(root.value) as HTMLElement | null;
let tracker: ActiveIndicator | undefined;

// The list is the parent: the indicator is a direct child of it. The base writes the `--active-tab-*` variables
// after mount and keeps them current while the list or any link resizes.
onMounted(() => {
  tracker = trackActiveIndicator({
    getList: () => indicatorElement()?.parentElement ?? null,
    getItems: () => ctx.getEntries().flatMap((entry) => entry.element() ?? []),
    getActiveItem: () =>
      ctx
        .getEntries()
        .find((entry) => entry.active())
        ?.element() ?? null,
    getIndicator: indicatorElement,
  });
  tracker.update();
});
watch(
  ctx.links,
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
