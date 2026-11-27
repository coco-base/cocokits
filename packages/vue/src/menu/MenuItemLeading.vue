<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue';
import { getMenuProps, menuAnatomy } from '@cocokits/machines/menu';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useMenuContext } from './menu.context';
import type { MenuItemLeadingProps } from './menu-parts.types';

defineOptions({ name: 'CckMenuItemLeading', inheritAttrs: false });

withDefaults(defineProps<MenuItemLeadingProps>(), { as: 'span', asChild: false });
defineSlots<{
  /**
   * The content before the text, such as an icon. When not set, the part is empty.
   *
   * @example
   * <MenuItemLeading><SvgIcon icon-name="pencil" /></MenuItemLeading>
   */
  default?(): unknown;
}>();

const ctx = useMenuContext('MenuItemLeading');
const themeAttrs = useThemeAttrs(menuAnatomy);
const attrs = useAttrs();
const machine = computed(() => getMenuProps(ctx.state.value, ctx.send).itemLeading);
const bound = computed(() => mergeProps(themeAttrs.value.itemLeading, attrs, { ...machine.value }));
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild">
    <slot />
  </Primitive>
</template>
