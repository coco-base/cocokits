<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue';
import { getMenuProps, menuAnatomy } from '@cocokits/machines/menu';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useMenuContext } from './menu.context';
import type { MenuItemTrailingProps } from './menu-parts.types';

defineOptions({ name: 'CckMenuItemTrailing', inheritAttrs: false });

withDefaults(defineProps<MenuItemTrailingProps>(), { as: 'span', asChild: false });
defineSlots<{
  /**
   * The content after the text, such as an icon. When not set, the part is empty.
   *
   * @example
   * <MenuItemTrailing><SvgIcon icon-name="chevron-right" /></MenuItemTrailing>
   */
  default?(): unknown;
}>();

const ctx = useMenuContext('MenuItemTrailing');
const themeAttrs = useThemeAttrs(menuAnatomy);
const attrs = useAttrs();
const machine = computed(() => getMenuProps(ctx.state.value, ctx.send).itemTrailing);
const bound = computed(() => mergeProps(themeAttrs.value.itemTrailing, attrs, { ...machine.value }));
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild">
    <slot />
  </Primitive>
</template>
