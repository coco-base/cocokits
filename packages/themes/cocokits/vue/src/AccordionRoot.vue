<script setup lang="ts">
import { AccordionRoot as BaseAccordionRoot, type AccordionRootEmits } from '@cocokits/vue/accordion';
import { provideThemeOptions } from '@cocokits/vue-core';
import type { AccordionRootProps } from './accordion.types';
import { forwardModels } from './forward-models';

defineOptions({ name: 'AccordionRoot' });

// `undefined` lets the base decide each default.
const props = withDefaults(defineProps<AccordionRootProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  type: undefined,
  collapsible: undefined,
  disabled: undefined,
  orientation: undefined,
  dir: undefined,
  unmountOnHide: undefined,
  as: undefined,
  asChild: undefined,
  variant: undefined,
  size: undefined,
  togglePosition: undefined,
  hideToggle: undefined,
});
const emit = defineEmits<AccordionRootEmits>();

defineSlots<{
  /** The items. It receives `modelValue`. */
  default?(props: {
    /**
     * The open value: the value of the open item in `single` mode (`undefined` when none is open), the list of
     * open values in `multiple` mode.
     *
     * @cckSemantic none
     * @remarks Vue-only slot prop: the model of the root, as in Reka UI.
     */
    modelValue: string | string[] | undefined;
  }): unknown;
}>();

// The base root decides between controlled, local state and `defaultValue`: it gets the model only as the consumer wrote it.
const models = forwardModels(props, {
  modelValue: (value: string | string[] | undefined) => {
    emit('update:modelValue', value);
  },
});

provideThemeOptions('accordion', () => ({
  variant: props.variant,
  size: props.size,
  togglePosition: props.togglePosition,
  hideToggle: props.hideToggle,
}));
</script>

<template>
  <BaseAccordionRoot
    v-bind="models()"
    :default-value="defaultValue"
    :type="type"
    :collapsible="collapsible"
    :disabled="disabled"
    :orientation="orientation"
    :dir="dir"
    :unmount-on-hide="unmountOnHide"
    :as="as"
    :as-child="asChild"
  >
    <template #default="slotProps">
      <slot v-bind="slotProps" />
    </template>
  </BaseAccordionRoot>
</template>
