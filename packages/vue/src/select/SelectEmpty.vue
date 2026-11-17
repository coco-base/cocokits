<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue';
import { selectAnatomy } from '@cocokits/machines/select';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useSelectContext } from './select.context';
import type { SelectEmptyProps } from './select-parts.types';

defineOptions({ name: 'CckSelectEmpty', inheritAttrs: false });

withDefaults(defineProps<SelectEmptyProps>(), { as: 'div', asChild: false });
defineSlots<{
  /**
   * The text. When not set, the part is empty.
   *
   * @example
   * <SelectEmpty>No dish found</SelectEmpty>
   */
  default?(): unknown;
}>();

const ctx = useSelectContext<unknown>('SelectEmpty');
const themeAttrs = useThemeAttrs(selectAnatomy);
const attrs = useAttrs();
// Shown while a `filter` leaves no option: the list marks that with `data-empty`.
const shown = computed(() => ctx.parts.value.content['data-empty'] !== undefined);
const bound = computed(() => mergeProps(themeAttrs.value.empty, attrs, { ...ctx.parts.value.empty }));
const priorityAttrs = ['role'];
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot v-if="shown" />
  </Primitive>
</template>
