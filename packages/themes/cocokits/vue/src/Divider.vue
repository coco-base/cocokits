<script setup lang="ts">
import { Divider as BaseDivider } from '@cocokits/vue/divider';
import { provideThemeOptions } from '@cocokits/vue-core';
import type { DividerProps } from './divider.types';

defineOptions({ name: 'Divider' });

const props = withDefaults(defineProps<DividerProps>(), {
  orientation: undefined,
  decorative: undefined,
  size: undefined,
  color: undefined,
});

provideThemeOptions('divider', () => ({ size: props.size, color: props.color }));
</script>

<template>
  <BaseDivider :orientation="orientation" :decorative="decorative" />
</template>
