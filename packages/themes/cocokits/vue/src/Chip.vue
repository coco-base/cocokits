<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { Chip as BaseChip, type ChipEmits } from '@cocokits/vue/chip';
import { provideThemeOptions } from '@cocokits/vue-core';
import { forwardModels } from './forward-models';
import type { ChipProps } from './chip.types';

defineOptions({ name: 'Chip' });

const props = withDefaults(defineProps<ChipProps>(), {
  id: undefined,
  removable: undefined,
  disabled: undefined,
  selected: undefined,
  defaultSelected: undefined,
  removeLabel: undefined,
  as: undefined,
  asChild: undefined,
  size: undefined,
});
const emit = defineEmits<ChipEmits>();

defineSlots<{
  /** The text of the chip. When not set, the chip is empty. */
  default?(): unknown;
}>();

// The base decides between controlled, local state and the start value: it gets the model only as the consumer wrote it.
const models = forwardModels(props, {
  selected: (value: boolean) => {
    emit('update:selected', value);
  },
});

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
    v-bind="models()"
    :id="id"
    :removable="removable"
    :disabled="disabled"
    :default-selected="defaultSelected"
    :remove-label="removeLabel"
    :as="as"
    :as-child="asChild"
    @remove="emit('remove')"
  >
    <slot />
  </BaseChip>
</template>
