<script setup lang="ts">
import { Primitive } from '@cocokits/vue-core';
import type { MenuItemEmits, MenuItemProps } from './menu.types';
import { useMenuItem } from './use-menu-item';

defineOptions({ name: 'CckMenuItem', inheritAttrs: false });

const props = withDefaults(defineProps<MenuItemProps>(), { disabled: false, as: 'div', asChild: false });
const emit = defineEmits<MenuItemEmits>();
defineSlots<{
  /**
   * The content of the item: text, and an icon if you like. The text is what typing finds. When not set, the item
   * shows no text.
   *
   * @example
   * <MenuItem><SvgIcon icon-name="pencil" /> Rename</MenuItem>
   */
  default?(): unknown;
}>();

const { bound, priorityAttrs } = useMenuItem({
  part: 'MenuItem',
  kind: 'item',
  themePart: 'item',
  disabled: () => props.disabled,
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
