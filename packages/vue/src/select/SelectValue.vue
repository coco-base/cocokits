<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue';
import { selectAnatomy } from '@cocokits/machines/select';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useSelectContext } from './select.context';
import type { SelectValueProps } from './select.types';

defineOptions({ name: 'CckSelectValue', inheritAttrs: false });

withDefaults(defineProps<SelectValueProps>(), { placeholder: '', as: 'span', asChild: false });
defineSlots<{
  /**
   * Your own content for the trigger, in place of the labels of the selected items. The slot gives you the labels and the value.
   *
   * The slot is used only while something is selected. While nothing is selected, the placeholder shows.
   *
   * @defaultValue The trigger shows the labels of the selected items, joined with a comma.
   * @example
   * <SelectValue placeholder="Choose a dish" #default="{ selectedLabel }">
   *   Dish: {{ selectedLabel.join(' and ') }}
   * </SelectValue>
   */
  default?(props: {
    /**
     * The label of each selected value, in the order of the values. A label comes from the `items` of the root, then from `itemToStringLabel`, then from the value as text.
     * @cckSemantic none
     * @cckParity Slot prop.
     */
    selectedLabel: readonly string[];
    /**
     * The value of the root. It is one value or `null`, or a list of values with `multiple`.
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
