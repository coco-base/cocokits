<script setup lang="ts">
import { computed, mergeProps, useAttrs, type ComponentPublicInstance } from 'vue';
import { getPopoverProps, popoverAnatomy } from '@cocokits/machines/popover';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import { usePopoverContext } from './popover.context';
import type { PopoverArrowProps } from './popover.types';

defineOptions({ name: 'CckPopoverArrow', inheritAttrs: false });

withDefaults(defineProps<PopoverArrowProps>(), { as: 'span', asChild: false });
defineSlots<{
  /**
   * Your own shape for the arrow. It renders inside the `<svg>` of the arrow. When not set, the arrow shows a
   * triangle.
   *
   * It is not used with `asChild`, where the child is the arrow.
   *
   * @example
   * <PopoverArrow><circle cx="5" cy="5" r="5" /></PopoverArrow>
   */
  default?(): unknown;
}>();

const ctx = usePopoverContext('PopoverArrow');
const themeAttrs = useThemeAttrs(popoverAnatomy);
const attrs = useAttrs();
const machine = computed(
  () => getPopoverProps({ id: ctx.id, open: ctx.open.value, arrowHidden: ctx.arrowHidden.value }, ctx.send).arrow,
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
