<script setup lang="ts">
import { MenuRadioItem as BaseMenuRadioItem, type MenuRadioItemEmits } from '@cocokits/vue/menu';
import { provideThemeOptions } from '@cocokits/vue-core';
import type { MenuRadioItemProps } from './menu-item.types';

defineOptions({ name: 'MenuRadioItem' });

// `undefined` lets the base decide each default.
const props = withDefaults(defineProps<MenuRadioItemProps>(), {
  disabled: undefined,
  as: undefined,
  asChild: undefined,
  color: undefined,
});
const emit = defineEmits<MenuRadioItemEmits>();

defineSlots<{
  /** The content of the item: an indicator, an icon, the text. When not set, the item shows no text. */
  default?(): unknown;
}>();

provideThemeOptions('menu', () => ({ color: props.color }));
</script>

<template>
  <BaseMenuRadioItem :value="value" :disabled="disabled" :as="as" :as-child="asChild" @select="emit('select', $event)">
    <slot />
  </BaseMenuRadioItem>
</template>
