<script setup lang="ts">
import { MenuCheckboxItem as BaseMenuCheckboxItem, type MenuCheckboxItemEmits } from '@cocokits/vue/menu';
import { provideThemeOptions } from '@cocokits/vue-core';
import { forwardModels } from './forward-models';
import type { MenuCheckboxItemProps } from './menu-item.types';

defineOptions({ name: 'MenuCheckboxItem' });

// `undefined` lets the base decide each default.
const props = withDefaults(defineProps<MenuCheckboxItemProps>(), {
  modelValue: undefined,
  defaultChecked: undefined,
  disabled: undefined,
  as: undefined,
  asChild: undefined,
  color: undefined,
});
const emit = defineEmits<MenuCheckboxItemEmits>();

defineSlots<{
  /** The content of the item: an indicator, an icon, the text. When not set, the item shows no text. */
  default?(): unknown;
}>();

// The base decides between controlled, local state and the start value: it gets the model only as the consumer wrote it.
const models = forwardModels(props, {
  modelValue: (value: boolean) => {
    emit('update:modelValue', value);
  },
});

provideThemeOptions('menu', () => ({ color: props.color }));
</script>

<template>
  <BaseMenuCheckboxItem
    v-bind="models()"
    :default-checked="defaultChecked"
    :disabled="disabled"
    :as="as"
    :as-child="asChild"
    @select="emit('select', $event)"
  >
    <slot />
  </BaseMenuCheckboxItem>
</template>
