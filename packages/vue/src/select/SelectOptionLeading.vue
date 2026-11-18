<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue';
import { selectAnatomy } from '@cocokits/machines/select';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useSelectContext } from './select.context';
import type { SelectOptionLeadingProps } from './select-parts.types';

defineOptions({ name: 'CckSelectOptionLeading', inheritAttrs: false });

withDefaults(defineProps<SelectOptionLeadingProps>(), { as: 'span', asChild: false });
defineSlots<{
  /**
   * The icon or picture. When not set, the part is empty.
   *
   * @example
   * <SelectOptionLeading><SvgIcon icon-name="pizza" /></SelectOptionLeading>
   */
  default?(): unknown;
}>();

const ctx = useSelectContext<unknown>('SelectOptionLeading');
const themeAttrs = useThemeAttrs(selectAnatomy);
const attrs = useAttrs();

const bound = computed(() => mergeProps(themeAttrs.value.optionLeading, attrs, { ...ctx.parts.value.optionLeading }));
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild">
    <slot />
  </Primitive>
</template>
