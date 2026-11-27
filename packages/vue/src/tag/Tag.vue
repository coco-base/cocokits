<script setup lang="ts">
import { useTemplateRef, type ComponentPublicInstance } from 'vue';
import { getTagProps, tagAnatomy } from '@cocokits/machines/tag';
import { Primitive, useThemeAttrs } from '@cocokits/vue-core';
import { rootElementOf } from '../internal/root-element';
import type { TagProps } from './tag.types';

defineOptions({ name: 'CckTag' });

withDefaults(defineProps<TagProps>(), { as: 'span', asChild: false });

defineSlots<{
  /**
   * The text of the Tag. An `SvgIcon` can go before or after the text. When not set, the Tag is empty.
   *
   * @example
   * <Tag><SvgIcon icon-name="check" /> Passed</Tag>
   */
  default?(): unknown;
}>();

const themeAttrs = useThemeAttrs(tagAnatomy);
const parts = getTagProps();

const root = useTemplateRef<ComponentPublicInstance>('root');

defineExpose({
  /**
   * The DOM element of the Tag: the `<span>`, or the element of the `as` component or the `asChild` child. It is
   * `null` before mount.
   *
   * @example
   * <Tag ref="tag">Paid</Tag>
   * <!-- In the script: const tag = useTemplateRef('tag'); then tag.value?.element is the element. -->
   *
   * @cckSemantic none
   * @cckParity Templates reach the DOM node through the component ref.
   */
  get element(): Element | null {
    return rootElementOf(root.value);
  },
});
</script>

<template>
  <Primitive ref="root" :as="as" :as-child="asChild" v-bind="{ ...themeAttrs.root, ...parts.root }"><slot /></Primitive>
</template>
