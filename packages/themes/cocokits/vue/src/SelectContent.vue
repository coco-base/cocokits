<script setup lang="ts">
import { inject } from 'vue';
import {
  SelectContent as BaseSelectContent,
  type SelectContentEmits,
  type SelectContentProps,
} from '@cocokits/vue/select';
import { provideThemeOptions } from '@cocokits/vue-core';
import { selectThemeKey } from './theme-keys';

defineOptions({ name: 'SelectContent' });

// `undefined` lets the base decide each default.
const props = withDefaults(defineProps<SelectContentProps>(), {
  side: undefined,
  align: undefined,
  dir: undefined,
  forceMount: undefined,
  sideOffset: undefined,
  alignOffset: undefined,
  avoidCollisions: undefined,
  collisionPadding: undefined,
  sticky: undefined,
  hideWhenDetached: undefined,
  collisionBoundary: undefined,
  updatePositionStrategy: undefined,
  sideFlip: undefined,
  alignFlip: undefined,
  prioritizePosition: undefined,
  disableUpdateOnLayoutShift: undefined,
  as: undefined,
  asChild: undefined,
});
const emit = defineEmits<SelectContentEmits>();

defineSlots<{
  /** The list: `SelectItem`, `SelectGroup` and `SelectSeparator` elements. */
  default?(): unknown;
}>();

// The options of the `SelectRoot` around it; the list draws them, whatever theme wrapper sits between them.
const root = inject(selectThemeKey, null);
provideThemeOptions('select', () => ({ size: root?.().size, indicator: root?.().indicator }));
</script>

<template>
  <BaseSelectContent
    v-bind="props"
    @escape-key-down="emit('escapeKeyDown', $event)"
    @pointer-down-outside="emit('pointerDownOutside', $event)"
  >
    <slot />
  </BaseSelectContent>
</template>
