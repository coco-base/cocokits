<script setup lang="ts">
import { computed, inject, mergeProps, onBeforeUnmount, onMounted, useAttrs } from 'vue';
import { selectAnatomy } from '@cocokits/machines/select';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { SELECT_ITEM_KEY, useSelectContext } from './select.context';
import type { SelectOptionDescriptionProps } from './select-parts.types';

defineOptions({ name: 'CckSelectOptionDescription', inheritAttrs: false });

withDefaults(defineProps<SelectOptionDescriptionProps>(), { as: 'span', asChild: false });
defineSlots<{
  /**
   * The text. When not set, the part is empty.
   *
   * @example
   * <SelectOptionDescription>Tomato and cheese</SelectOptionDescription>
   */
  default?(): unknown;
}>();

const ctx = useSelectContext<unknown>('SelectOptionDescription');
const item = inject(SELECT_ITEM_KEY, undefined);
const themeAttrs = useThemeAttrs(selectAnatomy);
const attrs = useAttrs();
const machine = computed(() =>
  ctx.parts.value.optionDescription({ key: item?.key ?? '', value: undefined, id: item?.itemId() }),
);
const bound = computed(() => mergeProps(themeAttrs.value.optionDescription, attrs, { ...machine.value }));
const priorityAttrs = ['id'];

// The option is described by this text while it is mounted.
let release: (() => void) | undefined;
onMounted(() => {
  release = item?.describe();
});
onBeforeUnmount(() => {
  release?.();
});
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot />
  </Primitive>
</template>
