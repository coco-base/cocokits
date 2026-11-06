<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue';
import { selectAnatomy } from '@cocokits/machines/select';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useSelectContext } from './select.context';
import type { SelectValueProps } from './select.types';

defineOptions({ name: 'CckSelectValue', inheritAttrs: false });

withDefaults(defineProps<SelectValueProps>(), { placeholder: '', as: 'span', asChild: false });
defineSlots<{
  /** What the trigger shows while something is selected, in place of the labels. It receives the labels and the value. */
  default?(props: {
    /**
     * The label of each selected value, in value order: from the `items` of the root, else `itemToStringLabel`,
     * else the value as text.
     *
     * @cckSemantic none
     * @cckParity Slot prop.
     */
    selectedLabel: readonly string[];
    /**
     * The model of the root: a value or `null`, or the list with `multiple`.
     *
     * @cckSemantic none
     * @cckParity Slot prop.
     */
    modelValue: unknown;
  }): unknown;
}>();

const ctx = useSelectContext<unknown>('SelectValue');
const themeAttrs = useThemeAttrs(selectAnatomy);
const attrs = useAttrs();
const empty = computed(() => ctx.empty.value);
const bound = computed(() =>
  mergeProps(empty.value ? themeAttrs.value.placeholder : themeAttrs.value.value, attrs, {
    class: empty.value ? ctx.parts.value.placeholder.class : ctx.parts.value.value.class,
  }),
);
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild">
    <slot v-if="asChild || !empty" :selected-label="ctx.selectedLabels.value" :model-value="ctx.modelValue.value">{{
      ctx.valueText.value
    }}</slot>
    <template v-else>{{ placeholder }}</template>
  </Primitive>
</template>
