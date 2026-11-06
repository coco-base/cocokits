<script setup lang="ts">
import { computed, provide } from 'vue';
import { createTooltipGroup } from '@cocokits/machines/tooltip';
import { TOOLTIP_PROVIDER_KEY } from './tooltip.context';
import type { TooltipProviderProps } from './tooltip.types';

defineOptions({ name: 'CckTooltipProvider' });

const props = withDefaults(defineProps<TooltipProviderProps>(), {
  delayDuration: 700,
  skipDelayDuration: 300,
  disableHoverableContent: false,
  disableClosingTrigger: false,
  disabled: false,
});
defineSlots<{
  /**
   * The tooltips the provider gives its defaults and its delay group. The provider renders no element around them.
   *
   * @cckSemantic none
   * @cckParity Not available in every framework.
   */
  default?(): unknown;
}>();

// A new group when the window changes: the old one's open and close facts do not carry over.
const group = computed(() => createTooltipGroup({ skipDelayDuration: props.skipDelayDuration }));
provide(TOOLTIP_PROVIDER_KEY, {
  delayDuration: computed(() => props.delayDuration),
  disableHoverableContent: computed(() => props.disableHoverableContent),
  disableClosingTrigger: computed(() => props.disableClosingTrigger),
  disabled: computed(() => props.disabled),
  group,
});
</script>

<template>
  <slot />
</template>
