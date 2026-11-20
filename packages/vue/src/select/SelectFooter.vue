<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue';
import { selectAnatomy } from '@cocokits/machines/select';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useSelectContext } from './select.context';
import type { SelectFooterProps } from './select-parts.types';

defineOptions({ name: 'CckSelectFooter', inheritAttrs: false });

withDefaults(defineProps<SelectFooterProps>(), { as: 'div', asChild: false });
defineSlots<{
  /**
   * Your actions. When not set, the footer is empty.
   *
   * @example
   * <SelectFooter><button type="button">Add a dish</button></SelectFooter>
   */
  default?(): unknown;
}>();

const ctx = useSelectContext<unknown>('SelectFooter');
const themeAttrs = useThemeAttrs(selectAnatomy);
const attrs = useAttrs();
// A press in the part is its own: the list would keep the focus where it is.
const bound = computed(() =>
  mergeProps(themeAttrs.value.footer, attrs, {
    ...ctx.parts.value.footer,
    onMousedown: (event: MouseEvent) => {
      event.stopPropagation();
    },
  }),
);
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild">
    <slot />
  </Primitive>
</template>
