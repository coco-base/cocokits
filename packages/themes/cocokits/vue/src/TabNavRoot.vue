<script setup lang="ts">
import { TabNavRoot as BaseTabNavRoot } from '@cocokits/vue/tab-nav';
import { provideThemeOptions } from '@cocokits/vue-core';
import type { TabNavRootProps } from './tab-nav.types';

defineOptions({ name: 'TabNavRoot' });

// `undefined` lets the base decide each default.
const props = withDefaults(defineProps<TabNavRootProps>(), {
  tabPanel: undefined,
  as: undefined,
  asChild: undefined,
  variant: undefined,
  color: undefined,
  size: undefined,
  headerAlign: undefined,
});

defineSlots<{
  /** The `TabNavList` with the links and the indicator. */
  default?(): unknown;
}>();

provideThemeOptions('tab-nav', () => ({
  variant: props.variant,
  color: props.color,
  size: props.size,
  headerAlign: props.headerAlign,
}));
</script>

<template>
  <BaseTabNavRoot :tab-panel="tabPanel" :as="as" :as-child="asChild">
    <slot />
  </BaseTabNavRoot>
</template>
