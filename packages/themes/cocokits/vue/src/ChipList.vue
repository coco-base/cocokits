<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { ChipList as BaseChipList, type ChipListEmits } from '@cocokits/vue/chip-list';
import { provideThemeOptions } from '@cocokits/vue-core';
import { forwardModels } from './forward-models';
import type { ChipListProps } from './chip-list.types';

defineOptions({ name: 'ChipList' });

// `undefined` lets the base decide each default.
const props = withDefaults(defineProps<ChipListProps>(), {
  id: undefined,
  ariaDescribedby: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  placeholder: undefined,
  name: undefined,
  form: undefined,
  addOnBlur: undefined,
  disabled: undefined,
  readonly: undefined,
  required: undefined,
  invalid: undefined,
  pending: undefined,
  hidden: undefined,
  touched: undefined,
  dirty: undefined,
  submitted: undefined,
  modelValue: undefined,
  modelModifiers: undefined,
  defaultValue: undefined,
  as: undefined,
  asChild: undefined,
  size: undefined,
});
const emit = defineEmits<ChipListEmits>();

defineSlots<{
  /** The one child the root merges onto, used with `asChild` only. When not set, the list renders its own element. */
  default?(): unknown;
}>();

// The base decides between controlled, local state and the start value: it gets the model only as the consumer wrote it.
const models = forwardModels(props, {
  modelValue: (value: string[]) => {
    emit('update:modelValue', value);
  },
});

const base = useTemplateRef<{ readonly element: Element | null; readonly inputElement: HTMLInputElement | null }>(
  'base',
);

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
  /**
   * The native text box. It is `null` before mount.
   *
   * @cckSemantic none
   * @remarks Templates reach the DOM node through the component ref.
   */
  get inputElement(): HTMLInputElement | null {
    return base.value?.inputElement ?? null;
  },
});

provideThemeOptions('chip-list', () => ({ size: props.size }));
</script>

<template>
  <BaseChipList
    ref="base"
    v-bind="models()"
    :default-value="defaultValue"
    :id="id"
    :aria-describedby="ariaDescribedby"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :placeholder="placeholder"
    :name="name"
    :form="form"
    :add-on-blur="addOnBlur"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    :invalid="invalid"
    :pending="pending"
    :hidden="hidden"
    :touched="touched"
    :dirty="dirty"
    :submitted="submitted"
    :as="as"
    :as-child="asChild"
  >
    <slot />
  </BaseChipList>
</template>
