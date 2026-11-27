<script setup lang="ts">
import { inject } from 'vue';
import { TooltipContent as BaseTooltipContent } from '@cocokits/vue/tooltip';
import { provideThemeOptions } from '@cocokits/vue-core';
import type { TooltipContentEmits, TooltipContentProps } from './tooltip.types';
import { tooltipThemeKey } from './theme-keys';

defineOptions({ name: 'TooltipContent' });

// `undefined` lets the base decide each default.
const props = withDefaults(defineProps<TooltipContentProps>(), {
  side: undefined,
  align: undefined,
  as: undefined,
  asChild: undefined,
  ariaLabel: undefined,
  forceMount: undefined,
  sideOffset: undefined,
  alignOffset: undefined,
  avoidCollisions: undefined,
  collisionPadding: undefined,
  sticky: undefined,
  hideWhenDetached: undefined,
  collisionBoundary: undefined,
  updatePositionStrategy: undefined,
  arrowPadding: undefined,
  hideShiftedArrow: undefined,
  sideFlip: undefined,
  alignFlip: undefined,
  prioritizePosition: undefined,
  disableUpdateOnLayoutShift: undefined,
});
const emit = defineEmits<TooltipContentEmits>();

defineSlots<{
  /** The text of the tooltip and an optional `TooltipArrow`. */
  default?(): unknown;
}>();

// The size of the `TooltipRoot` around it; the content draws it, whatever theme wrapper sits between them.
const root = inject(tooltipThemeKey, null);
provideThemeOptions('tooltip', () => ({ size: root?.().size }));
</script>

<template>
  <BaseTooltipContent
    v-bind="props"
    @escape-key-down="emit('escapeKeyDown', $event)"
    @pointer-down-outside="emit('pointerDownOutside', $event)"
  >
    <slot />
  </BaseTooltipContent>
</template>
