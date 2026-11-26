<script setup lang="ts">
import { computed, h, inject, mergeProps, useAttrs, useSlots, type VNode } from 'vue';
import { getMenuProps, menuAnatomy } from '@cocokits/machines/menu';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { Nodes, partIconNodes } from '../internal/own-content';
import { usePartIcon } from '../internal/use-part-icon';
import { SvgIcon } from '../svg-icon';
import { MENU_ITEM_KEY, useMenuContext } from './menu.context';
import type { MenuItemIndicatorProps } from './menu-parts.types';

defineOptions({ name: 'CckMenuItemIndicator', inheritAttrs: false });

const props = withDefaults(defineProps<MenuItemIndicatorProps>(), { as: 'span', asChild: false });
defineSlots<{
  /**
   * The mark: an icon or a symbol. The theme shows it while the item is checked. When not set, the part shows the
   * icon its theme names, else the default `check`.
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
const slots = useSlots();
const iconName = usePartIcon(menuAnatomy.block, 'itemIndicator');
/** Whether the part merges onto its slot child: `asChild`, or `as="template"`, which means the same. */
const merges = computed(() => props.asChild || props.as === 'template');
/** The content of the part: the author's, else its icon. */
const content = (own: VNode[] | undefined): VNode[] => partIconNodes(own, h(SvgIcon, { iconName: iconName.value }));
const machine = computed(() =>
  getMenuProps(ctx.state.value, ctx.send).itemIndicator({ checked: item?.checked.value === true }),
);
const bound = computed(() => mergeProps(themeAttrs.value.itemIndicator, attrs, { ...machine.value }));
const priorityAttrs = ['aria-hidden', 'data-state'];
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="merges" :as-child-content="content" :priority-attrs="priorityAttrs">
    <slot v-if="merges" />
    <Nodes v-else :nodes="content(slots.default?.())" />
  </Primitive>
</template>
