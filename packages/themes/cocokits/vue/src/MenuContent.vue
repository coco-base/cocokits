<script setup lang="ts">
import { MenuContent as BaseMenuContent, type MenuContentEmits } from '@cocokits/vue/menu';
import { provideThemeOptions } from '@cocokits/vue-core';
import type { MenuContentProps } from './menu.types';

defineOptions({ name: 'MenuContent' });

// `undefined` lets the base decide each default.
const props = withDefaults(defineProps<MenuContentProps>(), {
  side: undefined,
  align: undefined,
  sideOffset: undefined,
  alignOffset: undefined,
  as: undefined,
  asChild: undefined,
  size: undefined,
});

const emit = defineEmits<MenuContentEmits>();

provideThemeOptions('menu', () => ({ size: props.size }));
</script>

<template>
  <BaseMenuContent
    :side="side"
    :align="align"
    :side-offset="sideOffset"
    :align-offset="alignOffset"
    :as="as"
    :as-child="asChild"
    @escape-key-down="emit('escapeKeyDown', $event)"
    @pointer-down-outside="emit('pointerDownOutside', $event)"
    @focus-outside="emit('focusOutside', $event)"
    @interact-outside="emit('interactOutside', $event)"
  >
    <slot />
  </BaseMenuContent>
</template>
