<script setup lang="ts">
import { inject } from 'vue';
import { Primitive } from '@cocokits/vue-core';
import { MENU_RADIO_GROUP_KEY } from './menu.context';
import type { MenuRadioItemEmits, MenuRadioItemProps } from './menu-parts.types';
import { useMenuItem } from './use-menu-item';

defineOptions({ name: 'CckMenuRadioItem', inheritAttrs: false });

const props = withDefaults(defineProps<MenuRadioItemProps>(), { disabled: false, as: 'div', asChild: false });
const emit = defineEmits<MenuRadioItemEmits>();
defineSlots<{
  /**
   * The content of the item: an indicator, an icon, the text. The text is what typing finds. When not set, the item
   * shows no text.
   *
   * @example
   * <MenuRadioItem value="name"><MenuItemIndicator>x</MenuItemIndicator> Name</MenuRadioItem>
   */
  default?(): unknown;
}>();

const group = inject(MENU_RADIO_GROUP_KEY, undefined);

const { bound, priorityAttrs } = useMenuItem({
  part: 'MenuRadioItem',
  kind: 'radio',
  themePart: 'radioItem',
  disabled: () => props.disabled,
  checked: () => group?.value.value === props.value,
  value: () => props.value,
  change: (change) => {
    if (change.type === 'radio') group?.set(change.value);
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
