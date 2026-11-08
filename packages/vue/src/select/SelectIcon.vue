<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue';
import { selectAnatomy } from '@cocokits/machines/select';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useSelectContext } from './select.context';
import type { SelectIconProps } from './select.types';

defineOptions({ name: 'CckSelectIcon', inheritAttrs: false });

withDefaults(defineProps<SelectIconProps>(), { as: 'span', asChild: false });
defineSlots<{
  /**
   * The icon to draw in place of the icon of the theme. When not set, the icon of the theme shows.
   *
   * @example
   * <SelectIcon>
   *   <svg aria-hidden="true" viewBox="0 0 16 16"><path d="M4 6l4 4 4-4" /></svg>
   * </SelectIcon>
   */
  default?(): unknown;
}>();

const ctx = useSelectContext<unknown>('SelectIcon');
const themeAttrs = useThemeAttrs(selectAnatomy);
const attrs = useAttrs();
const bound = computed(() => mergeProps(themeAttrs.value.dropdownIcon, attrs, { ...ctx.parts.value.dropdownIcon }));
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild">
    <slot />
  </Primitive>
</template>
