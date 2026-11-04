<script setup lang="ts">
import { computed, mergeProps, onMounted, useAttrs, watch } from 'vue';
import { getTabNavProps, tabNavAnatomy } from '@cocokits/machines/tab-nav';
import { isDevelopment, Primitive, useThemeAttrs } from '@cocokits/vue-core';
import type { TabNavPanelProps } from './tab-nav.types';

defineOptions({ name: 'CckTabNavPanel', inheritAttrs: false });

const props = withDefaults(defineProps<TabNavPanelProps>(), { hasActiveLink: true, as: 'div', asChild: false });
defineSlots<{
  /** The routed content, usually a router outlet. */
  default?(): unknown;
}>();

const themeAttrs = useThemeAttrs(tabNavAnatomy);
const attrs = useAttrs();
const machine = computed(() =>
  getTabNavProps({ panelId: props.id }).panel({ id: props.id, hasActiveLink: props.hasActiveLink }),
);
// An `aria-labelledby` of the author wins; the role and the tab stop never change.
const bound = computed(() => {
  const labelledBy = attrs['aria-labelledby'];
  return mergeProps(
    themeAttrs.value.panel,
    attrs,
    { ...machine.value },
    labelledBy === undefined ? {} : { 'aria-labelledby': labelledBy },
  );
});
const priorityAttrs = ['id', 'role', 'tabindex', 'tabIndex'];

// After mount: the label must point at an element of the page, or the author forgot `hasActiveLink`.
function checkLabel(): void {
  const labelledBy = bound.value['aria-labelledby'];
  if (!isDevelopment() || typeof labelledBy !== 'string') return;
  if (!labelledBy.split(/\s+/).every((target) => document.getElementById(target) !== null)) {
    console.warn(
      `CocoKits: <TabNavPanel id="${props.id}"> is labelled by "${labelledBy}", which matches no element. ` +
        'Set :has-active-link="false" while no link is active, or give the active link that id.',
    );
  }
}
onMounted(checkLabel);
watch(() => bound.value['aria-labelledby'], checkLabel, { flush: 'post' });
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot />
  </Primitive>
</template>
