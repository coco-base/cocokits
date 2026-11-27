<script setup lang="ts">
import { Primitive } from '@cocokits/vue-core';
import { useDefaultModel } from '../internal/use-default-model';
import type { MenuCheckboxItemEmits, MenuCheckboxItemProps } from './menu-parts.types';
import { useMenuItem } from './use-menu-item';

defineOptions({ name: 'CckMenuCheckboxItem', inheritAttrs: false });

const props = withDefaults(defineProps<MenuCheckboxItemProps>(), {
  modelValue: undefined,
  defaultChecked: undefined,
  disabled: false,
  as: 'div',
  asChild: false,
});
const emit = defineEmits<MenuCheckboxItemEmits>();
defineSlots<{
  /**
   * The content of the item: an indicator, an icon, the text. The text is what typing finds. When not set, the item
   * shows no text.
   *
   * @example
   * <MenuCheckboxItem v-model="showGrid"><MenuItemIndicator>x</MenuItemIndicator> Show grid</MenuCheckboxItem>
   */
  default?(): unknown;
}>();

const model = useDefaultModel(props, 'modelValue', props.defaultChecked);

const { bound, priorityAttrs } = useMenuItem({
  part: 'MenuCheckboxItem',
  kind: 'checkbox',
  themePart: 'checkboxItem',
  disabled: () => props.disabled,
  checked: () => model.value === true,
  change: (change) => {
    if (change.type === 'checkbox') model.value = change.checked; // emits update:modelValue
  },
  select: () => {
    const select = new Event('select', { cancelable: true });
    emit('select', select);
    return select.defaultPrevented;
  },
});
</script>

<template>
  <Primitive ref="root" v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot />
  </Primitive>
</template>
