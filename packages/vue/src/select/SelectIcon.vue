<script setup lang="ts">
import { computed, mergeProps, useAttrs, useSlots } from 'vue';
import { selectAnatomy } from '@cocokits/machines/select';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { Nodes, partIconNodes, usePartIconName } from '../internal/part-icon';
import { useSelectContext } from './select.context';
import type { SelectIconProps } from './select.types';

defineOptions({ name: 'CckSelectIcon', inheritAttrs: false });

withDefaults(defineProps<SelectIconProps>(), { as: 'span', asChild: false });
defineSlots<{
  /**
   * The icon to draw in place of the icon of the theme. When not set, the icon of the theme shows.
   *
   * @example
   * <SelectIcon><SvgIcon icon-name="arrow-down" /></SelectIcon>
   */
  default?(): unknown;
}>();

const ctx = useSelectContext<unknown>('SelectIcon');
const themeAttrs = useThemeAttrs(selectAnatomy);
const attrs = useAttrs();
const bound = computed(() => mergeProps(themeAttrs.value.dropdownIcon, attrs, { ...ctx.parts.value.dropdownIcon }));
const slots = useSlots();
const iconName = usePartIconName(selectAnatomy.block, 'dropdownIcon');
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild">
    <slot v-if="asChild" />
    <Nodes v-else :nodes="partIconNodes(slots.default?.(), iconName)" />
  </Primitive>
</template>
