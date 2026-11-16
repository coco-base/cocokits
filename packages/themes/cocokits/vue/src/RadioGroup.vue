<script setup lang="ts">
import { provide, useTemplateRef } from 'vue';
import { RadioGroup as BaseRadioGroup, type RadioGroupEmits } from '@cocokits/vue/radio-group';
import { provideThemeOptions } from '@cocokits/vue-core';
import { forwardModels } from './forward-models';
import { radioGroupThemeKey } from './theme-keys';
import type { RadioGroupProps } from './radio-group.types';

defineOptions({ name: 'RadioGroup' });

// `undefined` lets the base decide each default.
const props = withDefaults(defineProps<RadioGroupProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  name: undefined,
  disabled: undefined,
  required: undefined,
  touched: undefined,
  form: undefined,
  orientation: undefined,
  loop: undefined,
  dir: undefined,
  as: undefined,
  asChild: undefined,
  size: undefined,
  color: undefined,
  labelPosition: undefined,
});
const emit = defineEmits<RadioGroupEmits>();

defineSlots<{
  /** The radios, in any markup. When not set, the group is empty. */
  default?(): unknown;
}>();

// The base decides between controlled, local state and the start value: it gets the model only as the consumer wrote it.
const models = forwardModels(props, {
  modelValue: (value: string | null) => {
    emit('update:modelValue', value);
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

const values = () => ({ size: props.size, color: props.color, labelPosition: props.labelPosition });
provideThemeOptions('radio-group', values);
// The radios inside that set no option of their own take these.
provide(radioGroupThemeKey, values);
</script>

<template>
  <BaseRadioGroup
    ref="base"
    v-bind="models()"
    :default-value="defaultValue"
    :name="name"
    :disabled="disabled"
    :required="required"
    :touched="touched"
    :form="form"
    :orientation="orientation"
    :loop="loop"
    :dir="dir"
    :as="as"
    :as-child="asChild"
  >
    <slot />
  </BaseRadioGroup>
</template>
