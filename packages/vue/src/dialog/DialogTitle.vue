<script setup lang="ts">
import { computed, mergeProps, onBeforeUnmount, onMounted, useAttrs } from 'vue';
import { dialogAnatomy, getDialogProps } from '@cocokits/machines/dialog';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useDialogContext } from './dialog.context';
import type { DialogTitleProps } from './dialog.types';

defineOptions({ name: 'CckDialogTitle', inheritAttrs: false });

withDefaults(defineProps<DialogTitleProps>(), { as: 'h2', asChild: false });
defineSlots<{
  /** The title text. */
  default?(): unknown;
}>();

const ctx = useDialogContext('DialogTitle');
const themeAttrs = useThemeAttrs(dialogAnatomy);
const attrs = useAttrs();
const machine = computed(() => getDialogProps({ id: ctx.id, open: ctx.open.value }, ctx.send).title);
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
