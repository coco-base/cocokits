<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { FormField as BaseFormField } from '@cocokits/vue/form-field';
import { provideThemeOptions } from '@cocokits/vue-core';
import type { FormFieldProps } from './form-field.types';

defineOptions({ name: 'FormField' });

const props = withDefaults(defineProps<FormFieldProps>(), {
  id: undefined,
  disabled: undefined,
  readonly: undefined,
  required: undefined,
  invalid: undefined,
  hideRequiredMarker: undefined,
  hidden: undefined,
  as: undefined,
  asChild: undefined,
  size: undefined,
});

defineSlots<{
  /** The label of the control. */
  label?(): unknown;
  /** The control. */
  default?(): unknown;
  /** The hints. Several are allowed. */
  hint?(): unknown;
  /** Content outside the box, before it. */
  leading?(): unknown;
  /** Content inside the box, before the control. */
  prefix?(): unknown;
  /** Content inside the box, after the control. */
  suffix?(): unknown;
  /** Content outside the box, after it. */
  trailing?(): unknown;
  /** The error messages, after the hints. Several are allowed. */
  error?(): unknown;
}>();

const base = useTemplateRef<{ readonly element: Element | null }>('base');

defineExpose({
  /**
   * The DOM element of the FormField: the `<div>`, or the element of the `as` component or `asChild` child.
   * `null` before mount.
   *
   * @cckSemantic none
   * @remarks Vue-only member: templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return base.value?.element ?? null;
  },
});

provideThemeOptions('form-field', () => ({ size: props.size }));
</script>

<template>
  <BaseFormField
    ref="base"
    :id="id"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    :invalid="invalid"
    :hide-required-marker="hideRequiredMarker"
    :hidden="hidden"
    :as="as"
    :as-child="asChild"
  >
    <template v-if="$slots['label']" #label><slot name="label" /></template>
    <template v-if="$slots['hint']" #hint><slot name="hint" /></template>
    <template v-if="$slots['leading']" #leading><slot name="leading" /></template>
    <template v-if="$slots['prefix']" #prefix><slot name="prefix" /></template>
    <template v-if="$slots['suffix']" #suffix><slot name="suffix" /></template>
    <template v-if="$slots['trailing']" #trailing><slot name="trailing" /></template>
    <template v-if="$slots['error']" #error><slot name="error" /></template>
    <slot />
  </BaseFormField>
</template>
