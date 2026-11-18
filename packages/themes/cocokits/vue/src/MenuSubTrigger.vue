<script setup lang="ts">
import { MenuSubTrigger as BaseMenuSubTrigger } from '@cocokits/vue/menu';
import { provideThemeOptions } from '@cocokits/vue-core';
import type { MenuSubTriggerProps } from './menu-item.types';

defineOptions({ name: 'MenuSubTrigger' });

// `undefined` lets the base decide each default.
const props = withDefaults(defineProps<MenuSubTriggerProps>(), {
  disabled: undefined,
  as: undefined,
  asChild: undefined,
  color: undefined,
});

defineSlots<{
  /** The content of the sub-trigger: text, and an icon if you like. When not set, the sub-trigger shows no text. */
  default?(): unknown;
}>();

provideThemeOptions('menu', () => ({ color: props.color }));
</script>

<template>
  <BaseMenuSubTrigger :disabled="disabled" :as="as" :as-child="asChild">
    <slot />
  </BaseMenuSubTrigger>
</template>
