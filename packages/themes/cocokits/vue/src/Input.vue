<script setup lang="ts">
import { inject, useTemplateRef } from 'vue';
import { Input as BaseInput, type InputEmits } from '@cocokits/vue/input';
import { provideThemeOptions } from '@cocokits/vue-core';
import { resolveInheritedValue } from '@cocokits/theme-cocokits';
import { forwardModels } from './forward-models';
import { formFieldThemeKey } from './theme-keys';
import type { InputProps } from './input.types';

defineOptions({ name: 'Input' });

const props = withDefaults(defineProps<InputProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  id: undefined,
  ariaDescribedby: undefined,
  type: undefined,
  name: undefined,
  disabled: undefined,
  readonly: undefined,
  required: undefined,
  invalid: undefined,
  pending: undefined,
  hidden: undefined,
  touched: undefined,
  dirty: undefined,
  submitted: undefined,
  size: undefined,
});
const emit = defineEmits<InputEmits>();

// The base decides between controlled, local state and the start value: it gets the model only as the consumer wrote it.
const models = forwardModels(props, {
  modelValue: (value: string) => {
    emit('update:modelValue', value);
  },
});

const base = useTemplateRef<{ readonly element: HTMLInputElement | null }>('base');

defineExpose({
  /**
   * The native `<input>`. `null` before mount.
   *
   * @cckSemantic none
   * @remarks Templates reach the DOM node through the component ref.
   */
  get element(): HTMLInputElement | null {
    return base.value?.element ?? null;
  },
});

const field = inject(formFieldThemeKey, null);
provideThemeOptions('input', () => ({ size: resolveInheritedValue(props.size, field?.().size) }));
</script>

<template>
  <BaseInput
    ref="base"
    v-bind="models()"
    :default-value="defaultValue"
    :id="id"
    :aria-describedby="ariaDescribedby"
    :type="type"
    :name="name"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    :invalid="invalid"
    :pending="pending"
    :hidden="hidden"
    :touched="touched"
    :dirty="dirty"
    :submitted="submitted"
  />
</template>
