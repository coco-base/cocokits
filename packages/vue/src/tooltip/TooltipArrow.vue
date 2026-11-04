<script setup lang="ts">
import { computed, mergeProps, useAttrs, type ComponentPublicInstance } from 'vue';
import { getTooltipProps, tooltipAnatomy } from '@cocokits/machines/tooltip';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import { useTooltipContext } from './tooltip.context';
import type { TooltipArrowProps } from './tooltip.types';

defineOptions({ name: 'CckTooltipArrow', inheritAttrs: false });

withDefaults(defineProps<TooltipArrowProps>(), { as: 'span', asChild: false });
defineSlots<{
  /** Replaces the triangle: it renders inside the `svg` of the arrow. Unused with `asChild`, where the child is the arrow. */
  default?(): unknown;
}>();

const ctx = useTooltipContext('TooltipArrow');
const themeAttrs = useThemeAttrs(tooltipAnatomy);
const attrs = useAttrs();
const machine = computed(
  () => getTooltipProps({ id: ctx.id, open: ctx.open.value, arrowHidden: ctx.arrowHidden.value }, ctx.send).arrow,
);
const bound = computed(() => mergeProps(themeAttrs.value.arrow, attrs, { ...machine.value }));
const priorityAttrs = ['aria-hidden', 'hidden'];

// The positioning module places the element: the content hands it over when it starts.
function setArrow(instance: unknown): void {
  ctx.arrowElement.value = rootElementOf(instance as ComponentPublicInstance | null) as HTMLElement | null;
}
</script>

<template>
  <Primitive :ref="setArrow" v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot v-if="asChild" />
    <svg v-else width="10" height="5" viewBox="0 0 30 10" preserveAspectRatio="none" style="display: block">
      <slot><polygon points="0,0 30,0 15,10" /></slot>
    </svg>
  </Primitive>
</template>
