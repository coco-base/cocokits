<script setup lang="ts">
import { inject, useTemplateRef } from 'vue';
import { Textarea as BaseTextarea, type TextareaEmits } from '@cocokits/vue/textarea';
import { provideThemeOptions } from '@cocokits/vue-core';
import { resolveInheritedValue } from '@cocokits/theme-cocokits';
import { forwardModels } from './forward-models';
import { formFieldThemeKey } from './theme-keys';
import type { TextareaProps } from './textarea.types';

defineOptions({ name: 'Textarea' });

const props = withDefaults(defineProps<TextareaProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  id: undefined,
  ariaDescribedby: undefined,
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
  autoResize: undefined,
  resize: undefined,
});
const emit = defineEmits<TextareaEmits>();

// The base decides between controlled, local state and the start value: it gets the model only as the consumer wrote it.
const models = forwardModels(props, {
  modelValue: (value: string) => {
    emit('update:modelValue', value);
  },
});

const base = useTemplateRef<{ readonly element: HTMLTextAreaElement | null }>('base');

defineExpose({
  /**
   * The native `<textarea>`. `null` before mount.
   *
   * @cckSemantic none
   * @remarks Templates reach the DOM node through the component ref.
   */
  get element(): HTMLTextAreaElement | null {
    return base.value?.element ?? null;
  },
});

const field = inject(formFieldThemeKey, null);
provideThemeOptions('textarea', () => ({
  size: resolveInheritedValue(props.size, field?.().size),
  autoResize: props.autoResize,
  resize: props.resize,
}));
</script>

<template>
  <BaseTextarea
    ref="base"
    v-bind="models()"
    :default-value="defaultValue"
    :id="id"
    :aria-describedby="ariaDescribedby"
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
