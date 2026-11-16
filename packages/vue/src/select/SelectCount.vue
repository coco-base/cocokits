<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue';
import { selectAnatomy } from '@cocokits/machines/select';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useSelectContext } from './select.context';
import type { SelectCountProps } from './select-parts.types';

defineOptions({ name: 'CckSelectCount', inheritAttrs: false });

withDefaults(defineProps<SelectCountProps>(), { as: 'span', asChild: false });
defineSlots<{
  /**
   * Your own content for the count, in place of `+N`. When not set, the part shows `+N`.
   *
   * @example
   * <SelectCount>and more</SelectCount>
   */
  default?(): unknown;
}>();

const ctx = useSelectContext<unknown>('SelectCount');
const themeAttrs = useThemeAttrs(selectAnatomy);
const attrs = useAttrs();

const count = computed(() => ctx.parts.value.count);
const bound = computed(() => mergeProps(themeAttrs.value.count, attrs, { class: count.value?.class }));
</script>

<template>
  <Primitive v-if="count" v-bind="bound" :as="as" :as-child="asChild">
    <slot>{{ count.text }}</slot>
  </Primitive>
</template>
