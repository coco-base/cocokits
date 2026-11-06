<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { getInputProps, inputAnatomy } from '@cocokits/machines/input';
import { useThemeAttrs } from '@cocokits/vue-core';
import { useDefaultModel } from '../internal/use-default-model';
import { useTextControl } from '../internal/use-text-control';
import type { InputEmits, InputProps } from './input.types';

defineOptions({ name: 'CckInput', inheritAttrs: false });

// A Boolean prop that is absent would be `false`; `undefined` lets a given `touched`, `dirty` or `submitted` win.
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
});
defineEmits<InputEmits>();

const model = useDefaultModel(props, 'modelValue', props.defaultValue);

const themeAttrs = useThemeAttrs(inputAnatomy);
const element = useTemplateRef<HTMLInputElement>('element');
const { text, className, boundAttrs, onInput, onFocus, onBlur } = useTextControl<HTMLInputElement>(props, {
  componentName: 'Input',
  model,
  elementRef: element,
  rootThemeAttrs: () => themeAttrs.value.root,
  getParts: (state, field) => getInputProps({ ...state, type: props.type }, field),
});

defineExpose({
  /**
   * The native `<input>`. `null` before mount.
   *
   * @cckSemantic none
   * @cckParity Vue-only member: templates reach the DOM node through the component ref.
   */
  get element(): HTMLInputElement | null {
    return element.value;
  },
});
</script>

<template>
  <input
    ref="element"
    v-bind="boundAttrs()"
    :class="className"
    :value="text"
    @input="onInput"
    @focus="onFocus"
    @blur="onBlur"
  />
</template>
