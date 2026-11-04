<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { Radio as BaseRadio, type RadioEmits } from '@cocokits/vue/radio';
import { provideThemeOptions } from '@cocokits/vue-core';
import { forwardModels } from './forward-models';
import type { RadioProps } from './radio.types';

defineOptions({ name: 'Radio' });

// A Boolean prop that is absent would be `false`; `undefined` lets the base decide.
const props = withDefaults(defineProps<RadioProps>(), {
  modelValue: undefined,
  defaultChecked: undefined,
  id: undefined,
  ariaDescribedby: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  name: undefined,
  value: undefined,
  disabled: undefined,
  required: undefined,
  asChild: undefined,
  size: undefined,
  color: undefined,
  labelPosition: undefined,
});
const emit = defineEmits<RadioEmits>();

defineSlots<{
  /** The label content: the caption of the radio. */
  default?(): unknown;
}>();

// The base decides between controlled, local state and the start value: it gets the model only as the consumer wrote it.
const models = forwardModels(props, {
  modelValue: (value: boolean) => {
    emit('update:modelValue', value);
  },
});

const base = useTemplateRef<{ readonly element: Element | null; readonly inputElement: HTMLInputElement | null }>(
  'base',
);

defineExpose({
  /**
   * The DOM element of the root. `null` before mount.
   *
   * @cckSemantic none
   * @remarks Vue-only member: templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return base.value?.element ?? null;
  },
  /**
   * The native `<input>`. `null` before mount.
   *
   * @cckSemantic none
   * @remarks Vue-only member: templates reach the DOM node through the component ref.
   */
  get inputElement(): HTMLInputElement | null {
    return base.value?.inputElement ?? null;
  },
});

provideThemeOptions('radio', () => ({ size: props.size, color: props.color, labelPosition: props.labelPosition }));
</script>

<template>
  <BaseRadio
    ref="base"
    v-bind="models()"
    :default-checked="defaultChecked"
    :id="id"
    :aria-describedby="ariaDescribedby"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :name="name"
    :value="value"
    :disabled="disabled"
    :required="required"
    :as="as"
    :as-child="asChild"
  >
    <slot />
  </BaseRadio>
</template>
