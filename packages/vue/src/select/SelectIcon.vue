<script setup lang="ts">
import { computed, h, mergeProps, useAttrs, useSlots, type VNode } from 'vue';
import { selectAnatomy } from '@cocokits/machines/select';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { Nodes, partIconNodes, usePartIconName } from '../internal/part-icon';
import { SvgIcon } from '../svg-icon';
import { useSelectContext } from './select.context';
import type { SelectIconProps } from './select.types';

defineOptions({ name: 'CckSelectIcon', inheritAttrs: false });

const props = withDefaults(defineProps<SelectIconProps>(), { as: 'span', asChild: false });
defineSlots<{
  /**
   * The icon to draw in place of the icon of the theme. When not set, the icon of the theme shows.
   *
   * @example
   * <SelectIcon><SvgIcon icon-name="arrow-down" /></SelectIcon>
   */
  default?(): unknown;
}>();

const ctx = useSelectContext<unknown>('SelectIcon');
const themeAttrs = useThemeAttrs(selectAnatomy);
const attrs = useAttrs();
const bound = computed(() => mergeProps(themeAttrs.value.dropdownIcon, attrs, { ...ctx.parts.value.dropdownIcon }));
const slots = useSlots();
const iconName = usePartIconName(selectAnatomy.block, 'dropdownIcon');
/** Whether the part merges onto its slot child: `asChild`, or `as="template"`, which means the same. */
const merges = computed(() => props.asChild || props.as === 'template');
/** The content of the part: the author's, else the icon of the theme. With `asChild` the child's own children. */
const content = (own: VNode[] | undefined): VNode[] =>
  partIconNodes(own, iconName.value === undefined ? undefined : h(SvgIcon, { iconName: iconName.value }));
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="merges" :as-child-content="content">
    <slot v-if="merges" />
    <Nodes v-else :nodes="content(slots.default?.())" />
  </Primitive>
</template>
