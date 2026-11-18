<script setup lang="ts">
import { computed, inject, mergeProps, useAttrs } from 'vue';
import { getMenuProps, menuAnatomy } from '@cocokits/machines/menu';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { MENU_ITEM_KEY, useMenuContext } from './menu.context';
import type { MenuItemIndicatorProps } from './menu-parts.types';

defineOptions({ name: 'CckMenuItemIndicator', inheritAttrs: false });

withDefaults(defineProps<MenuItemIndicatorProps>(), { as: 'span', asChild: false });
defineSlots<{
  /**
   * The mark: an icon or a symbol. The theme shows it while the item is checked. When not set, the part is empty.
   *
   * @example
   * <MenuItemIndicator><SvgIcon icon-name="check" /></MenuItemIndicator>
   */
  default?(): unknown;
}>();

const ctx = useMenuContext('MenuItemIndicator');
const item = inject(MENU_ITEM_KEY, undefined);
const themeAttrs = useThemeAttrs(menuAnatomy);
const attrs = useAttrs();
const machine = computed(() =>
  getMenuProps(ctx.state.value, ctx.send).itemIndicator({ checked: item?.checked.value === true }),
);
const bound = computed(() => mergeProps(themeAttrs.value.itemIndicator, attrs, { ...machine.value }));
const priorityAttrs = ['aria-hidden', 'data-state'];
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot />
  </Primitive>
</template>
