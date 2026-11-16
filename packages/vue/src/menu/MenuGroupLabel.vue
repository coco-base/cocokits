<script setup lang="ts">
import { computed, inject, mergeProps, onBeforeUnmount, onMounted, useAttrs } from 'vue';
import { getMenuProps, menuAnatomy } from '@cocokits/machines/menu';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { MENU_GROUP_KEY, useMenuContext } from './menu.context';
import type { MenuGroupLabelProps } from './menu-parts.types';

defineOptions({ name: 'CckMenuGroupLabel', inheritAttrs: false });

withDefaults(defineProps<MenuGroupLabelProps>(), { as: 'div', asChild: false });
defineSlots<{
  /**
   * The name of the group: text, never a control. When not set, the group has no name.
   *
   * @example
   * <MenuGroupLabel>File</MenuGroupLabel>
   */
  default?(): unknown;
}>();

const ctx = useMenuContext('MenuGroupLabel');
const group = inject(MENU_GROUP_KEY, undefined);
const themeAttrs = useThemeAttrs(menuAnatomy);
const attrs = useAttrs();
const machine = computed(() => getMenuProps(ctx.state.value, ctx.send).groupLabel({ id: group?.id ?? '' }));
// Outside a group the label has no id to point at: only the class stays.
const bound = computed(() =>
  mergeProps(themeAttrs.value.groupLabel, attrs, group ? { ...machine.value } : { class: machine.value.class }),
);
const priorityAttrs = ['id'];

// The group is named by this label while it is mounted.
let release: (() => void) | undefined;
onMounted(() => {
  release = group?.label();
});
onBeforeUnmount(() => {
  release?.();
});
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="asChild" :priority-attrs="group ? priorityAttrs : undefined">
    <slot />
  </Primitive>
</template>
