<script setup lang="ts">
import { computed, inject, mergeProps, onBeforeUnmount, onMounted, useAttrs } from 'vue';
import { getMenuProps, menuAnatomy } from '@cocokits/machines/menu';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { MENU_ITEM_KEY, useMenuContext } from './menu.context';
import type { MenuItemSupportingTextProps } from './menu-parts.types';

defineOptions({ name: 'CckMenuItemSupportingText', inheritAttrs: false });

withDefaults(defineProps<MenuItemSupportingTextProps>(), { as: 'span', asChild: false });
defineSlots<{
  /**
   * The text. It describes the item. When not set, the part is empty.
   *
   * @example
   * <MenuItemSupportingText>Rename the file</MenuItemSupportingText>
   */
  default?(): unknown;
}>();

const ctx = useMenuContext('MenuItemSupportingText');
const item = inject(MENU_ITEM_KEY, undefined);
const themeAttrs = useThemeAttrs(menuAnatomy);
const attrs = useAttrs();
const machine = computed(() => getMenuProps(ctx.state.value, ctx.send).itemSupportingText({ key: item?.key ?? '' }));
const bound = computed(() => mergeProps(themeAttrs.value.itemSupportingText, attrs, { ...machine.value }));
const priorityAttrs = ['id'];

// The item is described by this text while it is mounted.
let release: (() => void) | undefined;
onMounted(() => {
  release = item?.describe();
});
onBeforeUnmount(() => {
  release?.();
});
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot />
  </Primitive>
</template>
