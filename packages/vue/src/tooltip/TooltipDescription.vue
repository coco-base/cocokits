<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue';
import { getTooltipProps, tooltipAnatomy } from '@cocokits/machines/tooltip';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useTooltipContext } from './tooltip.context';
import type { TooltipDescriptionProps } from './tooltip.types';

defineOptions({ name: 'CckTooltipDescription', inheritAttrs: false });

withDefaults(defineProps<TooltipDescriptionProps>(), { as: 'div', asChild: false });
defineSlots<{
  /**
   * The text of the description. When not set, the description is empty.
   *
   * @example
   * <TooltipDescription>Save</TooltipDescription>
   */
  default?(): unknown;
}>();

const ctx = useTooltipContext('TooltipDescription');
const themeAttrs = useThemeAttrs(tooltipAnatomy);
const attrs = useAttrs();
const machine = computed(() => getTooltipProps({ id: ctx.id, open: ctx.open.value }, ctx.send).description);
const bound = computed(() => mergeProps(themeAttrs.value.description, attrs, { ...machine.value }));
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild">
    <slot />
  </Primitive>
</template>
