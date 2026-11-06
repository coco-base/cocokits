<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { Switch as BaseSwitch, type SwitchEmits } from '@cocokits/vue/switch';
import { provideThemeOptions } from '@cocokits/vue-core';
import { forwardModels } from './forward-models';
import type { SwitchProps } from './switch.types';

defineOptions({ name: 'Switch' });

// A Boolean prop that is absent would be `false`; `undefined` lets the base decide.
const props = withDefaults(defineProps<SwitchProps>(), {
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
  size: undefined,
  color: undefined,
  labelPosition: undefined,
});
const emit = defineEmits<SwitchEmits>();

defineSlots<{
  /** The label content: the caption of the switch. */
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
   * @remarks Templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return base.value?.element ?? null;
  },
  /**
   * The native `<input>`. `null` before mount.
   *
   * @cckSemantic none
   * @remarks Templates reach the DOM node through the component ref.
   */
  get inputElement(): HTMLInputElement | null {
    return base.value?.inputElement ?? null;
  },
});

provideThemeOptions('switch', () => ({ size: props.size, color: props.color, labelPosition: props.labelPosition }));
</script>

<template>
  <BaseSwitch
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
  >
    <slot />
  </BaseSwitch>
</template>
