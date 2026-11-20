<script setup lang="ts">
import { provide } from 'vue';
import { TooltipRoot as BaseTooltipRoot, type TooltipRootEmits } from '@cocokits/vue/tooltip';
import { forwardModels } from './forward-models';
import { tooltipThemeKey } from './theme-keys';
import type { TooltipRootProps } from './tooltip.types';

defineOptions({ name: 'TooltipRoot' });

// `undefined` lets the base decide each default.
const props = withDefaults(defineProps<TooltipRootProps>(), {
  open: undefined,
  defaultOpen: undefined,
  delayDuration: undefined,
  disableHoverableContent: undefined,
  disableClosingTrigger: undefined,
  disabled: undefined,
  size: undefined,
});
const emit = defineEmits<TooltipRootEmits>();

defineSlots<{
  /** The trigger and the content. It receives `open`. */
  default?(props: {
    /**
     * Whether the tooltip is open.
     *
     * @cckSemantic none
     * @cckParity Slot prop: the open state of the root.
     * @remarks Slot prop: the open state of the root.
     */
    open: boolean;
  }): unknown;
}>();

// The base decides between controlled, local state and the start value: it gets the model only as the consumer wrote it.
const models = forwardModels(props, {
  open: (value: boolean) => {
    emit('update:open', value);
  },
});

// The root renders no element and no attribute: its `TooltipContent` reads the size and draws it.
provide(tooltipThemeKey, () => ({ size: props.size }));
</script>

<template>
  <BaseTooltipRoot
    v-bind="models()"
    :default-open="defaultOpen"
    :delay-duration="delayDuration"
    :disable-hoverable-content="disableHoverableContent"
    :disable-closing-trigger="disableClosingTrigger"
    :disabled="disabled"
  >
    <template #default="slotProps">
      <slot v-bind="slotProps" />
    </template>
  </BaseTooltipRoot>
</template>
