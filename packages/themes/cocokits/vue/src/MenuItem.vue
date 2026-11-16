<script setup lang="ts">
import { MenuItem as BaseMenuItem, type MenuItemEmits } from '@cocokits/vue/menu';
import { provideThemeOptions } from '@cocokits/vue-core';
import type { MenuItemProps } from './menu-item.types';

defineOptions({ name: 'MenuItem' });

// `undefined` lets the base decide each default.
const props = withDefaults(defineProps<MenuItemProps>(), {
  disabled: undefined,
  as: undefined,
  asChild: undefined,
  color: undefined,
});
const emit = defineEmits<MenuItemEmits>();

defineSlots<{
  /** The content of the item: text, and an icon if you like. When not set, the item shows no text. */
  default?(): unknown;
}>();

provideThemeOptions('menu', () => ({ color: props.color }));
</script>

<template>
  <BaseMenuItem :disabled="disabled" :as="as" :as-child="asChild" @select="emit('select', $event)">
    <slot />
  </BaseMenuItem>
</template>
