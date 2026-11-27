<script setup lang="ts">
import { computed, mergeProps, onBeforeUnmount, onMounted, useAttrs } from 'vue';
import { getPopoverProps, popoverAnatomy } from '@cocokits/machines/popover';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { usePopoverContext } from './popover.context';
import type { PopoverTitleProps } from './popover.types';

defineOptions({ name: 'CckPopoverTitle', inheritAttrs: false });

withDefaults(defineProps<PopoverTitleProps>(), { as: 'h2', asChild: false });
defineSlots<{
  /**
   * The text of the title. When not set, the title is empty and the popover needs another name.
   *
   * @example
   * <PopoverTitle>Share</PopoverTitle>
   */
  default?(): unknown;
}>();

const ctx = usePopoverContext('PopoverTitle');
const themeAttrs = useThemeAttrs(popoverAnatomy);
const attrs = useAttrs();
const machine = computed(() => getPopoverProps({ id: ctx.id, open: ctx.open.value }, ctx.send).title);
const bound = computed(() => mergeProps(themeAttrs.value.title, attrs, { ...machine.value }));
const priorityAttrs = ['id'];

// The content is labelled by the title while it is mounted.
onMounted(() => {
  ctx.titles.value += 1;
});
onBeforeUnmount(() => {
  ctx.titles.value -= 1;
});
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot />
  </Primitive>
</template>
