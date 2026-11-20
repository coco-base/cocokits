<script setup lang="ts">
import { computed, mergeProps, provide, shallowRef, useAttrs, useId } from 'vue';
import { getMenuProps, menuAnatomy } from '@cocokits/machines/menu';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { omit } from '../internal/record';
import { MENU_GROUP_KEY, useMenuContext } from './menu.context';
import type { MenuGroupProps } from './menu-parts.types';

defineOptions({ name: 'CckMenuGroup', inheritAttrs: false });

withDefaults(defineProps<MenuGroupProps>(), { as: 'div', asChild: false });
defineSlots<{
  /**
   * The group: a `MenuGroupLabel` and the items. When not set, the group is empty.
   *
   * @example
   * <MenuGroup>
   *   <MenuGroupLabel>File</MenuGroupLabel>
   *   <MenuItem>Rename</MenuItem>
   * </MenuGroup>
   */
  default?(): unknown;
}>();

const ctx = useMenuContext('MenuGroup');
const themeAttrs = useThemeAttrs(menuAnatomy);
const attrs = useAttrs();
const id = useId();
const labels = shallowRef(0);
const machine = computed(() => getMenuProps(ctx.state.value, ctx.send).group({ id, hasLabel: labels.value > 0 }));
provide(MENU_GROUP_KEY, {
  id,
  label: () => {
    labels.value += 1;
    return () => {
      labels.value -= 1;
    };
  },
});

// The machine's attributes are reserved: they replace the same attribute of the author.
const bound = computed(() =>
  mergeProps(themeAttrs.value.group, omit(attrs, 'role', 'aria-labelledby'), { ...machine.value }),
);
const priorityAttrs = ['role', 'aria-labelledby'];
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="priorityAttrs">
    <slot />
  </Primitive>
</template>
