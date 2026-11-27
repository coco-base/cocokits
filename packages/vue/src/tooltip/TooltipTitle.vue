<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue';
import { getTooltipProps, tooltipAnatomy } from '@cocokits/machines/tooltip';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useTooltipContext } from './tooltip.context';
import type { TooltipTitleProps } from './tooltip.types';

defineOptions({ name: 'CckTooltipTitle', inheritAttrs: false });

withDefaults(defineProps<TooltipTitleProps>(), { as: 'div', asChild: false });
defineSlots<{
  /**
   * The text of the title. When not set, the title is empty.
   *
   * @example
   * <TooltipTitle>Save</TooltipTitle>
   */
  default?(): unknown;
}>();

const ctx = useTooltipContext('TooltipTitle');
const themeAttrs = useThemeAttrs(tooltipAnatomy);
const attrs = useAttrs();
const machine = computed(() => getTooltipProps({ id: ctx.id, open: ctx.open.value }, ctx.send).title);
const bound = computed(() => mergeProps(themeAttrs.value.title, attrs, { ...machine.value }));
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild">
    <slot />
  </Primitive>
</template>
