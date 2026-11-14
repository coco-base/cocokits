<script setup lang="ts">
import { provide } from 'vue';
import { THEME_KEY, type ThemeProviderProps } from './theme-context';

defineOptions({ name: 'CckThemeProvider' });

const props = defineProps<ThemeProviderProps>();

defineSlots<{
  /** The subtree that is themed. */
  default?(): unknown;
}>();

provide(THEME_KEY, () => ({ themeConfig: props.themeConfig, overrides: props.overrides ?? {} }));
</script>

<template>
  <slot />
</template>
