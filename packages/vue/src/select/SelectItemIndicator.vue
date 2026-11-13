<script setup lang="ts">
import { computed, inject, mergeProps, useAttrs, useSlots } from 'vue';
import { selectAnatomy } from '@cocokits/machines/select';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { Nodes, partIconNodes, usePartIconName } from '../internal/part-icon';
import { SELECT_ITEM_KEY, useSelectContext } from './select.context';
import type { SelectItemIndicatorProps } from './select-list.types';

defineOptions({ name: 'CckSelectItemIndicator', inheritAttrs: false });

withDefaults(defineProps<SelectItemIndicatorProps>(), { as: 'span', asChild: false });
defineSlots<{
  /**
   * A mark to draw in place of the mark of the theme. When not set, the mark of the theme shows.
   *
   * @example
   * <SelectItemIndicator><SvgIcon icon-name="check" /></SelectItemIndicator>
   */
  default?(): unknown;
}>();

const ctx = useSelectContext<unknown>('SelectItemIndicator');
const themeAttrs = useThemeAttrs(selectAnatomy);
const attrs = useAttrs();
const item = inject(SELECT_ITEM_KEY, undefined);
const slots = useSlots();
const iconName = usePartIconName(selectAnatomy.block, 'optionIndicator');
const bound = computed(() =>
  mergeProps(themeAttrs.value.optionIndicator, attrs, { ...ctx.parts.value.optionIndicator }),
);
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild">
    <slot v-if="asChild" />
    <Nodes v-else :nodes="partIconNodes(slots.default?.(), iconName, item?.selected.value ?? false)" />
  </Primitive>
</template>
