<script setup lang="ts">
import { computed, mergeProps, useAttrs, type VNode } from 'vue';
import { getTabsProps, tabsAnatomy } from '@cocokits/machines/tabs';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useTabsContext } from './tabs.context';
import type { TabsContentProps } from './tabs.types';

defineOptions({ name: 'CckTabsContent', inheritAttrs: false });

const props = withDefaults(defineProps<TabsContentProps>(), { forceMount: undefined, as: 'div', asChild: false });
defineSlots<{
  /**
   * The content of the panel. It is rendered only while the tab is selected, or always with `forceMount`. When not
   * set, the panel is empty.
   *
   * @example
   * <TabsContent value="account">Change your name.</TabsContent>
   */
  default?(): unknown;
}>();

const ctx = useTabsContext('TabsContent');
const themeAttrs = useThemeAttrs(tabsAnatomy);
const attrs = useAttrs();
const parts = computed(() => getTabsProps(ctx.state.value, ctx.dispatch));
const machine = computed(() => parts.value.panel({ value: props.value }));
// `forceMount` is `true` or left out; the machine decides the rest (the root's `unmountOnHide` too).
const hasContent = computed(() =>
  parts.value.hasContent({ value: props.value }, props.forceMount === true ? true : undefined),
);
const bound = computed(() => mergeProps(themeAttrs.value.panel, attrs, { ...machine.value }));
// The state markers win over an `asChild` child's own props.
const priorityAttrs = [
  'id',
  'role',
  'aria-labelledby',
  'tabindex',
  'tabIndex',
  'hidden',
  'data-orientation',
  'data-selected',
];

// With `asChild` the content is the child's own children.
function inChild(hostChildren?: VNode[]): VNode[] {
  return hasContent.value ? (hostChildren ?? []) : [];
}
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs" :as-child-content="inChild">
    <slot v-if="hasContent || asChild" />
  </Primitive>
</template>
