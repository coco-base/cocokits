<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { Checkbox as BaseCheckbox, type CheckboxEmits } from '@cocokits/vue/checkbox';
import { provideThemeOptions } from '@cocokits/vue-core';
import { forwardModels } from './forward-models';
import type { CheckboxProps } from './checkbox.types';

defineOptions({ name: 'Checkbox' });

// A Boolean prop that is absent would be `false`; `undefined` lets the base decide.
const props = withDefaults(defineProps<CheckboxProps>(), {
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
  readonly: undefined,
  invalid: undefined,
  pending: undefined,
  hidden: undefined,
  touched: undefined,
  dirty: undefined,
  submitted: undefined,
  asChild: undefined,
  indeterminate: undefined,
  size: undefined,
  color: undefined,
  labelPosition: undefined,
});
const emit = defineEmits<CheckboxEmits>();

defineSlots<{
  /** The label content: the caption of the checkbox. */
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

provideThemeOptions('checkbox', () => ({ size: props.size, color: props.color, labelPosition: props.labelPosition }));
</script>

<template>
  <BaseCheckbox
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
    :readonly="readonly"
    :invalid="invalid"
    :pending="pending"
    :hidden="hidden"
    :touched="touched"
    :dirty="dirty"
    :submitted="submitted"
    :as="as"
    :as-child="asChild"
    :indeterminate="indeterminate"
  >
    <slot />
  </BaseCheckbox>
</template>
