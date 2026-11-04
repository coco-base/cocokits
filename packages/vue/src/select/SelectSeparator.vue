<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue';
import { selectAnatomy } from '@cocokits/machines/select';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useSelectContext } from './select.context';
import type { SelectSeparatorProps } from './select.types';

defineOptions({ name: 'CckSelectSeparator', inheritAttrs: false });

withDefaults(defineProps<SelectSeparatorProps>(), { as: 'div', asChild: false });

const ctx = useSelectContext<unknown>('SelectSeparator');
const themeAttrs = useThemeAttrs(selectAnatomy);
const attrs = useAttrs();
const bound = computed(() => mergeProps(themeAttrs.value.separator, attrs, { ...ctx.parts.value.separator }));
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild" />
</template>
