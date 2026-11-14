<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { Chip as BaseChip, type ChipEmits } from '@cocokits/vue/chip';
import { provideThemeOptions } from '@cocokits/vue-core';
import type { ChipProps } from './chip.types';

defineOptions({ name: 'Chip' });

const props = withDefaults(defineProps<ChipProps>(), {
  id: undefined,
  removable: undefined,
  disabled: undefined,
  as: undefined,
  asChild: undefined,
  size: undefined,
});
const emit = defineEmits<ChipEmits>();

defineSlots<{
  /** The text of the chip. When not set, the chip is empty. */
  default?(): unknown;
}>();

const base = useTemplateRef<{ readonly element: Element | null }>('base');

defineExpose({
  /**
   * The DOM element of the root: the `<div>`, or the element of the `as` component or the `asChild` child. It is
   * `null` before mount.
   *
   * @cckSemantic none
   * @remarks Templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return base.value?.element ?? null;
  },
});

provideThemeOptions('chip', () => ({ size: props.size }));
</script>

<template>
  <BaseChip
    ref="base"
    :id="id"
    :removable="removable"
    :disabled="disabled"
    :as="as"
    :as-child="asChild"
    @remove="emit('remove')"
  >
    <slot />
  </BaseChip>
</template>
