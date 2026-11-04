<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue';
import { selectAnatomy } from '@cocokits/machines/select';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useSelectContext } from './select.context';
import type { SelectItemIndicatorProps } from './select.types';

defineOptions({ name: 'CckSelectItemIndicator', inheritAttrs: false });

withDefaults(defineProps<SelectItemIndicatorProps>(), { as: 'span', asChild: false });
defineSlots<{
  /** What marks the item, if the theme draws nothing. */
  default?(): unknown;
}>();

const ctx = useSelectContext<unknown>('SelectItemIndicator');
const themeAttrs = useThemeAttrs(selectAnatomy);
const attrs = useAttrs();
const bound = computed(() =>
  mergeProps(themeAttrs.value.optionIndicator, attrs, { ...ctx.parts.value.optionIndicator }),
);
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild">
    <slot />
  </Primitive>
</template>
