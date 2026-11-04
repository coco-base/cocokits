<script setup lang="ts">
import { computed, inject, mergeProps, useAttrs } from 'vue';
import { selectAnatomy } from '@cocokits/machines/select';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { SELECT_GROUP_KEY, useSelectContext } from './select.context';
import type { SelectLabelProps } from './select.types';

defineOptions({ name: 'CckSelectLabel', inheritAttrs: false });

withDefaults(defineProps<SelectLabelProps>(), { as: 'div', asChild: false });
defineSlots<{
  /**
   * The label of the group: text and markup, never a control.
   *
   * @cckSemantic select.label
   */
  default?(): unknown;
}>();

const ctx = useSelectContext<unknown>('SelectLabel');
const group = inject(SELECT_GROUP_KEY, undefined);
const themeAttrs = useThemeAttrs(selectAnatomy);
const attrs = useAttrs();
// Inside a group the label is its name; the group refers to the id.
const bound = computed(() => {
  const machine = ctx.parts.value.optionGroupLabel({ key: group?.key ?? '', disabled: group?.disabled.value === true });
  return mergeProps(themeAttrs.value.optionGroupLabel, attrs, group ? { ...machine } : { class: machine.class });
});
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild">
    <slot />
  </Primitive>
</template>
