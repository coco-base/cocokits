<script setup lang="ts">
import { computed, h, inject, mergeProps, useAttrs, useSlots, type VNode } from 'vue';
import { selectAnatomy } from '@cocokits/machines/select';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { Nodes, partIconNodes } from '../internal/own-content';
import { usePartIcon } from '../internal/use-part-icon';
import { SvgIcon } from '../svg-icon';
import { SELECT_ITEM_KEY, useSelectContext } from './select.context';
import type { SelectItemIndicatorProps } from './select-list.types';

defineOptions({ name: 'CckSelectItemIndicator', inheritAttrs: false });

const props = withDefaults(defineProps<SelectItemIndicatorProps>(), { as: 'span', asChild: false });
defineSlots<{
  /**
   * A mark to draw in place of the mark of the part. When not set, the part shows the icon its theme names, else
   * the default `check`.
   *
   * @example
   * <SelectItemIndicator><SvgIcon icon-name="check" /></SelectItemIndicator>
   */
  default?(): unknown;
}>();

const ctx = useSelectContext<unknown>('SelectItemIndicator');
const themeAttrs = useThemeAttrs(selectAnatomy);
const attrs = useAttrs();
const item = inject(SELECT_ITEM_KEY, undefined);
const slots = useSlots();
const iconName = usePartIcon(selectAnatomy.block, 'optionIndicator');
/** Whether the part merges onto its slot child: `asChild`, or `as="template"`, which means the same. */
const merges = computed(() => props.asChild || props.as === 'template');
/** The content of the part: the author's, else its icon while the option is selected. */
const content = (own: VNode[] | undefined): VNode[] =>
  partIconNodes(own, item?.selected.value ? h(SvgIcon, { iconName: iconName.value }) : undefined);
const bound = computed(() =>
  mergeProps(themeAttrs.value.optionIndicator, attrs, { ...ctx.parts.value.optionIndicator }),
);
</script>

<template>
  <Primitive v-bind="bound" :as="as" :as-child="merges" :as-child-content="content">
    <slot v-if="merges" />
    <Nodes v-else :nodes="content(slots.default?.())" />
  </Primitive>
</template>
