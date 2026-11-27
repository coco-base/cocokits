<script setup lang="ts">
import { computed, mergeProps, useAttrs } from 'vue';
import { getMenuProps, menuAnatomy } from '@cocokits/machines/menu';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { useMenuContext } from './menu.context';
import type { MenuItemShortcutProps } from './menu-parts.types';

defineOptions({ name: 'CckMenuItemShortcut', inheritAttrs: false });

withDefaults(defineProps<MenuItemShortcutProps>(), { as: 'span', asChild: false });
defineSlots<{
  /**
   * The shortcut as text. When not set, the part is empty.
   *
   * @example
   * <MenuItemShortcut>Ctrl+R</MenuItemShortcut>
   */
  default?(): unknown;
}>();

const ctx = useMenuContext('MenuItemShortcut');
const themeAttrs = useThemeAttrs(menuAnatomy);
const attrs = useAttrs();
const machine = computed(() => getMenuProps(ctx.state.value, ctx.send).itemShortcut);
const bound = computed(() => mergeProps(themeAttrs.value.itemShortcut, attrs, { ...machine.value }));
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild">
    <slot />
  </Primitive>
</template>
