<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue';
import { dialogAnatomy, getDialogProps } from '@cocokits/machines/dialog';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useDialogContext } from './dialog.context';
import type { DialogFooterProps } from './dialog-parts.types';

defineOptions({ name: 'CckDialogFooter', inheritAttrs: false });

withDefaults(defineProps<DialogFooterProps>(), { as: 'div', asChild: false });
defineSlots<{
  /**
   * The content of the footer. When not set, the footer is empty.
   *
   * @example
   * <DialogFooter>...</DialogFooter>
   */
  default?(): unknown;
}>();

const ctx = useDialogContext('DialogFooter');
const themeAttrs = useThemeAttrs(dialogAnatomy);
const attrs = useAttrs();
const machine = computed(() => getDialogProps({ id: ctx.id, open: ctx.open.value }, ctx.send).footer);
const bound = computed(() => mergeProps(themeAttrs.value.footer, attrs, { ...machine.value }));
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild">
    <slot />
  </Primitive>
</template>
