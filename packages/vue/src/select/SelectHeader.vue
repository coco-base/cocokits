<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue';
import { selectAnatomy } from '@cocokits/machines/select';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useSelectContext } from './select.context';
import type { SelectHeaderProps } from './select-parts.types';

defineOptions({ name: 'CckSelectHeader', inheritAttrs: false });

withDefaults(defineProps<SelectHeaderProps>(), { as: 'div', asChild: false });
defineSlots<{
  /**
   * The search. When not set, the header is empty.
   *
   * @example
   * <SelectHeader><SelectSearch /></SelectHeader>
   */
  default?(): unknown;
}>();

const ctx = useSelectContext<unknown>('SelectHeader');
const themeAttrs = useThemeAttrs(selectAnatomy);
const attrs = useAttrs();
// A press in the part is its own: the list would keep the focus where it is.
const bound = computed(() =>
  mergeProps(themeAttrs.value.header, attrs, {
    ...ctx.parts.value.header,
    onMousedown: (event: MouseEvent) => {
      event.stopPropagation();
    },
  }),
);
</script>

<template>
  <Primitive v-if="ctx.filter.value" v-bind="bound" :as="as" :as-child="asChild">
    <slot />
  </Primitive>
</template>
