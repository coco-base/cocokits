<script setup lang="ts">
import { computed } from 'vue';
import { dividerAnatomy, getDividerProps } from '@cocokits/machines/divider';
import { useThemeAttrs } from '@cocokits/vue-core';
import type { DividerProps } from './divider.types';

defineOptions({ name: 'CckDivider' });

const props = withDefaults(defineProps<DividerProps>(), { orientation: 'horizontal', decorative: false });

const themeAttrs = useThemeAttrs(dividerAnatomy);
const parts = computed(() => getDividerProps({ orientation: props.orientation, decorative: props.decorative }));
</script>

<template>
  <hr v-bind="{ ...themeAttrs.root, ...parts.root }" />
</template>
