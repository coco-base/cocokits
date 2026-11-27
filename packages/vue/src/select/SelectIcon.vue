<script setup lang="ts">
import { computed, h, mergeProps, useAttrs, useSlots, type VNode } from 'vue';
import { selectAnatomy } from '@cocokits/machines/select';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { Nodes, partIconNodes } from '../internal/own-content';
import { usePartIcon } from '../internal/use-part-icon';
import { SvgIcon } from '../svg-icon';
import { useSelectContext } from './select.context';
import type { SelectIconProps } from './select.types';

defineOptions({ name: 'CckSelectIcon', inheritAttrs: false });

const props = withDefaults(defineProps<SelectIconProps>(), { as: 'span', asChild: false });
defineSlots<{
  /**
   * The icon to draw in place of the icon of the part. When not set, the part shows the icon its theme names, else
   * the default `chevron-down`.
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
const iconName = usePartIcon(selectAnatomy.block, 'dropdownIcon');
/** Whether the part merges onto its slot child: `asChild`, or `as="template"`, which means the same. */
const merges = computed(() => props.asChild || props.as === 'template');
/** The content of the part: the author's, else its icon. With `asChild` the child's own children. */
const content = (own: VNode[] | undefined): VNode[] => partIconNodes(own, h(SvgIcon, { iconName: iconName.value }));
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="merges" :as-child-content="content">
    <slot v-if="merges" />
    <Nodes v-else :nodes="content(slots.default?.())" />
  </Primitive>
</template>
