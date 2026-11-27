<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue';
import { dialogAnatomy, getDialogProps } from '@cocokits/machines/dialog';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useDialogContext } from './dialog.context';
import type { DialogBodyProps } from './dialog-parts.types';

defineOptions({ name: 'CckDialogBody', inheritAttrs: false });

withDefaults(defineProps<DialogBodyProps>(), { as: 'div', asChild: false });
defineSlots<{
  /**
   * The content of the body. When not set, the body is empty.
   *
   * @example
   * <DialogBody>...</DialogBody>
   */
  default?(): unknown;
}>();

const ctx = useDialogContext('DialogBody');
const themeAttrs = useThemeAttrs(dialogAnatomy);
const attrs = useAttrs();
const machine = computed(() => getDialogProps({ id: ctx.id, open: ctx.open.value }, ctx.send).body);
const bound = computed(() => mergeProps(themeAttrs.value.body, attrs, { ...machine.value }));
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild">
    <slot />
  </Primitive>
</template>
