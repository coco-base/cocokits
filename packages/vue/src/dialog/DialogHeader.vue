<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue';
import { dialogAnatomy, getDialogProps } from '@cocokits/machines/dialog';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useDialogContext } from './dialog.context';
import type { DialogHeaderProps } from './dialog-parts.types';

defineOptions({ name: 'CckDialogHeader', inheritAttrs: false });

withDefaults(defineProps<DialogHeaderProps>(), { as: 'div', asChild: false });
defineSlots<{
  /**
   * The content of the header. When not set, the header is empty.
   *
   * @example
   * <DialogHeader>...</DialogHeader>
   */
  default?(): unknown;
}>();

const ctx = useDialogContext('DialogHeader');
const themeAttrs = useThemeAttrs(dialogAnatomy);
const attrs = useAttrs();
const machine = computed(() => getDialogProps({ id: ctx.id, open: ctx.open.value }, ctx.send).header);
const bound = computed(() => mergeProps(themeAttrs.value.header, attrs, { ...machine.value }));
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild">
    <slot />
  </Primitive>
</template>
