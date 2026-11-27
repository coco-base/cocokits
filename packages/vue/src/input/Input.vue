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
const {
  text,
  className,
  boundAttrs,
  onInput,
  onFocus,
  onBlur,
  focus: focusControl,
  reset: resetControl,
} = useTextControl<HTMLInputElement>(props, {
  componentName: 'Input',
  model,
  elementRef: element,
  rootThemeAttrs: () => themeAttrs.value.root,
  getParts: (state, field) => getInputProps({ ...state, type: props.type }, field),
});

defineExpose({
  /**
   * The native `<input>`. It is `null` before mount.
   *
   * @example
   * <Input ref="email" v-model="email" type="email" aria-label="Email" />
   * <!-- In the script: const email = useTemplateRef('email'); then email.value?.element?.focus(). -->
   *
   * @cckSemantic none
   * @cckParity Templates reach the DOM node through the component ref.
   */
  get element(): HTMLInputElement | null {
    return element.value;
  },

  /**
   * Moves the focus to the native input. Does nothing before mount.
   *
   * @example
   * <Input ref="control" v-model="text" aria-label="Label" />
   * <!-- In the script: const control = useTemplateRef('control'); then control.value?.focus(). -->
   *
   * @cckSemantic input.focus
   */
  focus(options?: FocusOptions): void {
    focusControl(options);
  },
  /**
   * Clears the touched, dirty and submitted state that the Input keeps itself. The text does not change.
   *
   * @example
   * <Input ref="control" v-model="text" aria-label="Label" />
   * <!-- In the script: const control = useTemplateRef('control'); then control.value?.reset(). -->
   *
   * @cckSemantic input.reset
   */
  reset(): void {
    resetControl();
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
