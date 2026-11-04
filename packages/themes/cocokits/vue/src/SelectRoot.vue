<script setup lang="ts" generic="T, M extends boolean = false">
import { useTemplateRef } from 'vue';
import { SelectRoot as BaseSelectRoot, type SelectRootEmits } from '@cocokits/vue/select';
import { provideThemeOptions } from '@cocokits/vue-core';
import { forwardModels } from './forward-models';
import type { SelectRootProps } from './select.types';

defineOptions({ name: 'SelectRoot' });

// `undefined` lets the base decide each default.
const props = withDefaults(defineProps<SelectRootProps<T, M>>(), {
  modelValue: undefined,
  defaultValue: undefined,
  open: undefined,
  defaultOpen: undefined,
  items: undefined,
  itemToStringLabel: undefined,
  itemToStringValue: undefined,
  by: undefined,
  autocomplete: undefined,
  nullableValue: undefined,
  disabled: undefined,
  readonly: undefined,
  required: undefined,
  invalid: undefined,
  name: undefined,
  form: undefined,
  dir: undefined,
  size: undefined,
  asChild: false,
});
const emit = defineEmits<SelectRootEmits<T, M>>();

defineSlots<{
  /** The trigger and the list. It receives `modelValue` and `open`. */
  default?(props: {
    /**
     * The selected value: a `T` or `null`, or a list of `T` with `multiple`; `''`, `null` and an empty list mean nothing is selected.
     *
     * @cckSemantic none
     * @remarks Vue-only slot prop: the model of the root, as in Reka UI.
     */
    modelValue: SelectRootProps<T, M>['modelValue'];
    /**
     * Whether the list is open.
     *
     * @cckSemantic none
     * @remarks Vue-only slot prop: the open state of the root, as in Reka UI.
     */
    open: boolean;
  }): unknown;
}>();

// The base root decides between controlled, local state and the `default*` props: it gets the models only as the
// consumer wrote them.
const models = forwardModels(props, {
  modelValue: (value: SelectRootEmits<T, M>['update:modelValue'][0]) => {
    emit('update:modelValue', value);
  },
  open: (value: boolean) => {
    emit('update:open', value);
  },
});

provideThemeOptions('select', () => ({ size: props.size }));

const base = useTemplateRef<{ element: HTMLElement | null }>('base');
defineExpose({
  /**
   * The trigger element of the base Select. `null` before mount.
   *
   * @cckSemantic none
   * @remarks Vue-only member: templates reach the DOM node through the component ref.
   */
  get element(): HTMLElement | null {
    return base.value?.element ?? null;
  },
});
</script>

<template>
  <BaseSelectRoot
    ref="base"
    v-bind="models()"
    :default-value="defaultValue"
    :default-open="defaultOpen"
    :as-child="asChild"
    :multiple="multiple"
    :items="items"
    :item-to-string-label="itemToStringLabel"
    :item-to-string-value="itemToStringValue"
    :by="by"
    :autocomplete="autocomplete"
    :nullable-value="nullableValue"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    :invalid="invalid"
    :name="name"
    :form="form"
    :dir="dir"
  >
    <template #default="slotProps">
      <slot v-bind="slotProps" />
    </template>
  </BaseSelectRoot>
</template>
