<script setup lang="ts">
import { MenuContent as BaseMenuContent } from '@cocokits/vue/menu';
import { provideThemeOptions } from '@cocokits/vue-core';
import type { MenuContentProps } from './menu.types';

defineOptions({ name: 'MenuContent' });

// `undefined` lets the base decide each default. The listeners of the base emits arrive as attributes and fall
// through to the base component.
const props = withDefaults(defineProps<MenuContentProps>(), {
  side: undefined,
  align: undefined,
  sideOffset: undefined,
  alignOffset: undefined,
  as: undefined,
  asChild: undefined,
  size: undefined,
});

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
  >
    <slot />
  </BaseMenuContent>
</template>
