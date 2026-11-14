<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { getTextareaProps, textareaAnatomy } from '@cocokits/machines/textarea';
import { useThemeAttrs } from '@cocokits/vue-core';
import { useDefaultModel } from '../internal/use-default-model';
import { useTextControl } from '../internal/use-text-control';
import type { TextareaEmits, TextareaProps } from './textarea.types';

/** The text as a textarea holds it: CR and CRLF are LF, so a model with CRLF does not rewrite the DOM. */
const withLineFeeds = (text: string): string => text.replace(/\r\n?/g, '\n');

defineOptions({ name: 'CckTextarea', inheritAttrs: false });

// A Boolean prop that is absent would be `false`; `undefined` lets a given `touched`, `dirty` or `submitted` win.
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
});
defineEmits<TextareaEmits>();

const model = useDefaultModel(props, 'modelValue', props.defaultValue);

const themeAttrs = useThemeAttrs(textareaAnatomy);
const element = useTemplateRef<HTMLTextAreaElement>('element');
const { text, className, boundAttrs, onInput, onFocus, onBlur } = useTextControl<HTMLTextAreaElement>(props, {
  componentName: 'Textarea',
  model,
  elementRef: element,
  rootThemeAttrs: () => themeAttrs.value.root,
  getParts: getTextareaProps,
  toDomText: withLineFeeds,
});

defineExpose({
  /**
   * The native `<textarea>`. It is `null` before mount.
   *
   * @example
   * <Textarea ref="message" v-model="text" aria-label="Message" />
   * <!-- In the script: const message = useTemplateRef('message'); then message.value?.element?.focus(). -->
   *
   * @cckSemantic none
   * @cckParity Templates reach the DOM node through the component ref.
   */
  get element(): HTMLTextAreaElement | null {
    return element.value;
  },
});
</script>

<template>
  <textarea
    ref="element"
    v-bind="boundAttrs()"
    :class="className"
    :value="text"
    @input="onInput"
    @focus="onFocus"
    @blur="onBlur"
  />
</template>
