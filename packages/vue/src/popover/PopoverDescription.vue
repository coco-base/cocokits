<script setup lang="ts">
import { computed, mergeProps, onBeforeUnmount, onMounted, useAttrs } from 'vue';
import { getPopoverProps, popoverAnatomy } from '@cocokits/machines/popover';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { usePopoverContext } from './popover.context';
import type { PopoverDescriptionProps } from './popover.types';

defineOptions({ name: 'CckPopoverDescription', inheritAttrs: false });

withDefaults(defineProps<PopoverDescriptionProps>(), { as: 'p', asChild: false });
defineSlots<{
  /** The description text. */
  default?(): unknown;
}>();

const ctx = usePopoverContext('PopoverDescription');
const themeAttrs = useThemeAttrs(popoverAnatomy);
const attrs = useAttrs();
const machine = computed(() => getPopoverProps({ id: ctx.id, open: ctx.open.value }, ctx.send).description);
const bound = computed(() => mergeProps(themeAttrs.value.description, attrs, { ...machine.value }));
const priorityAttrs = ['id'];

// The content is described by the description while it is mounted.
onMounted(() => {
  ctx.descriptions.value += 1;
});
onBeforeUnmount(() => {
  ctx.descriptions.value -= 1;
});
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot />
  </Primitive>
</template>
