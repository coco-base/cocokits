<script setup lang="ts">
import { computed, mergeProps, onBeforeUnmount, onMounted, useAttrs } from 'vue';
import { dialogAnatomy, getDialogProps } from '@cocokits/machines/dialog';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useDialogContext } from './dialog.context';
import type { DialogDescriptionProps } from './dialog.types';

defineOptions({ name: 'CckDialogDescription', inheritAttrs: false });

withDefaults(defineProps<DialogDescriptionProps>(), { as: 'p', asChild: false });
defineSlots<{
  /** The description text. */
  default?(): unknown;
}>();

const ctx = useDialogContext('DialogDescription');
const themeAttrs = useThemeAttrs(dialogAnatomy);
const attrs = useAttrs();
const machine = computed(() => getDialogProps({ id: ctx.id, open: ctx.open.value }, ctx.send).description);
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
